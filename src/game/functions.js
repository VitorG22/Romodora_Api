const { nanoid } = require('nanoid')
const { PrismaClient } = require('../generated/prisma/client.js')
const { Game } = require('./gameClass.js')
const prisma = new PrismaClient()

let GamesInstancesList = []


function logGames() {
    console.log(GamesInstancesList)
}

async function hostGame(socket, gameData, callback) {
    console.log(socket.data.userData)

    try {
        const newGameDataInDB = await prisma.activeGame.upsert({
            where: { hostId: socket.data.userData.id },
            create: {
                id: nanoid(6),
                hostId: socket.data.userData.id,
                name: gameData.name,
                password: gameData.password || null
            },
            update: {
                id: nanoid(6),
                name: gameData.name,
                hostId: socket.data.userData.id,
                password: gameData.password || null
            }
        })



        let playersList = []
        playersList.push(socket.data.userData)

        let newGame = new Game({
            name: newGameDataInDB.name,
            hostId: socket.data.userData.id,
            lobbyId: newGameDataInDB.id,
            users: playersList
        })

        GamesInstancesList.push(newGame)

        socket.join(`GameRoom:${newGame.lobbyId}`)
        callback({
            status: 200,
            gameData: newGame
        }
        )
    } catch (error) {
        console.log(error)
    }
}

async function deleteGame(userData) {

    try {
        await prisma.activeGame.delete({
            where: {
                hostId: userData.id
            }
        })
        GamesInstancesList = GamesInstancesList.map((gameData) => { if (gameData.hostId != userData.id) return gameData })
    } catch (err) {
        
    }
}

async function getActiveGames(callback) {

    try {
        let activeGames = await prisma.activeGame.findMany({
            select: {
                id: true,
                name: true,
                password: true,
                game_host: {
                    select: {
                        name: true,
                        picture: true
                    }
                }
            }
        })

        activeGames = activeGames.map((gameData) => {
            return { ...gameData, password: !!gameData.password }
        })
        callback({ status: 200, activeGamesList: activeGames })

    } catch (error) {
        console.log(error)
        callback({ status: 400, activeGamesList: null })
    }
}

function joinInGame(gameId, socket,io, callback) {
    let game = FindGameInstanceById(gameId)

    if(!game){callback({status: 400})}
    game.users.push(socket.data.userData)
    
    
    socket.join(`GameRoom:${game.lobbyId}`)
    callback({status:200})
    
    EmitUpdateGame(game, io)
    
}

function EmitUpdateGame(gameData, io){
    // console.log(gameData, io)
    io.to(`GameRoom:${gameData.lobbyId}`).emit('updateGameData', gameData)
}

function quitFromGame({gameId}, socket, io){
    socket.leave(`GameRoom:${gameId}`)
    let game = FindGameInstanceById(gameId)
    userIndex = game.users.findIndex(userData => userData.id != socket.data.userData.id)
    game.users = game.users.slice(userIndex, 1)
    EmitUpdateGame(game, io)
}

function FindGameInstanceById(gameId){
    let game = GamesInstancesList.find((gameData)=>gameData.lobbyId == gameId) || null
    return game
}

module.exports = {
    hostGame,
    logGames,
    deleteGame,
    getActiveGames,
    joinInGame,
    quitFromGame
}