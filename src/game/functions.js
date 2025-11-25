const { nanoid } = require('nanoid')
const { Game } = require('./gameClass.js')


let GamesInstancesList = []

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


async function hostGame(socket, gameData, callback, io) {

    try {
        deleteGame(socket.data.userData.id)

        let playersList = []
        playersList.push({...socket.data.userData, color:getRandomColor()})

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
        gameInstanceIndex = GamesInstancesList.findIndex(gameData => gameData.hostData.id == userId)
        if (gameInstanceIndex != -1) {
            GamesInstancesList.splice(gameInstanceIndex, 1)
        }
    } catch (err) { }
}

async function getActiveGames(callback) {

    try {

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
    let randomColor = getRandomColor()

    if (!game) { callback({ status: 400 }) }
    game.users.push({...socket.data.userData, color:randomColor})
    game.tableControl.players.push({ ...socket.data.userData, character: null, color:randomColor })


    socket.join(`GameRoom:${game.lobbyId}`)
    callback({ status: 200, gameData: game })

    game.playerJoin(socket.data.userData.id)
}

function quitFromGame({ gameId }, socket, io) {
    socket.leave(`GameRoom:${gameId}`)
    let game = FindGameInstanceById(gameId)
    if (!game) {
        return
    }
    if (game.hostData.id == socket.data.userData.id) {
        deleteGame(socket.data.userData.id)
        return
    }

    let userIndex = game.users.findIndex(userData => userData.id == socket.data.userData.id)
    game.users.splice(userIndex, 1)

    let playerIndex = game.tableControl.players.findIndex(playerData => playerData.id == socket.data.userData.id)
    game.tableControl.players.splice(playerIndex, 1)

    game.playerLeave( socket.data.userData.id)
}

function FindGameInstanceById(gameId) {
    let game = GamesInstancesList.find((gameData) => gameData.lobbyId == gameId)
    return game
}

module.exports = {
    hostGame,
    deleteGame,
    getActiveGames,
    joinInGame,
    quitFromGame,
    FindGameInstanceById
}