const { nanoid } = require('nanoid')
const { PrismaClient } = require('../generated/prisma/client.js')
const { Game } = require('./gameClass.js')
const prisma = new PrismaClient()

let GamesInstancesList = []


function logGames() {
    console.log(GamesInstancesList)
}

async function hostGame(socket, gameData, callback, io) {

    try {
        deleteGame(socket.data.userData.id)

        let playersList = []
        playersList.push(socket.data.userData)

        let newGame = new Game({
            io: io,
            name: gameData.name,
            hostData: socket.data.userData,
            lobbyId: nanoid(6),
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

function deleteGame(userId) {

    try {
        gameInstanceIndex = GamesInstancesList.findIndex(gameData=> gameData.hostData.id == userId)
        if(gameInstanceIndex != -1){
            GamesInstancesList.splice(gameInstanceIndex, 1)
        }
    } catch (err) {}
}

async function getActiveGames(callback) {

    try {

        GamesInstancesList.map(gameData=> console.log(gameData.lobbyId))
        let activeGamesList = GamesInstancesList.map(gameData => {
            return {
                id: gameData.lobbyId,
                name: gameData.name,
                game_host: gameData.hostData,
                users: gameData.users
            }
        })

        callback({ status: 200, activeGamesList: activeGamesList })


    } catch (error) {
        console.log(error)
        callback({ status: 400, activeGamesList: null })
    }
}

function joinInGame(gameId, socket, io, callback) {
    let game = FindGameInstanceById(gameId)

    if (!game) { callback({ status: 400 }) }
    game.users.push(socket.data.userData)
    game.tableData.players.push({...socket.data.userData, character: null})


    socket.join(`GameRoom:${game.lobbyId}`)
    callback({ status: 200 })

    game.emitUpdateGame(game)
    

}

function quitFromGame({ gameId }, socket, io) {
    socket.leave(`GameRoom:${gameId}`)
    let game = FindGameInstanceById(gameId)
    if(!game){
        return
    }
    if(game.hostData.id == socket.data.userData.id){
        deleteGame(socket.data.userData.id)
        return
    }
    
    let userIndex = game.users.findIndex(userData => userData.id == socket.data.userData.id)
    game.users.splice(userIndex, 1)

    let playerIndex = game.tableData.players.findIndex(playerData => playerData.id == socket.data.userData.id) 
    game.tableData.players.splice(playerIndex, 1)

    game.emitUpdateGame({tableData: game.tableData})
}

function FindGameInstanceById(gameId) {
    GamesInstancesList.map((gameData) => console.log(gameData.lobbyId))
    let game = GamesInstancesList.find((gameData) => gameData.lobbyId == gameId)
    return game
}

module.exports = {
    hostGame,
    logGames,
    deleteGame,
    getActiveGames,
    joinInGame,
    quitFromGame,
    FindGameInstanceById
}