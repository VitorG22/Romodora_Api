const { Server } = require('socket.io')
const { GenerateRandomCode } = require('./scripts/randomCode')
const { getUserDataByToken } = require('./userFunctions/userData')
const { FindGameInstanceById, hostGame, logGames, deleteGame, getActiveGames, joinInGame, quitFromGame } = require('./game/functions')

function startSocket(server) {
    const io = new Server(server, {
        maxHttpBufferSize: 1e10,
        cors: { origin: '*' }
    })

    const rooms = io.of('/').adapter.rooms


    io.on('connection', (socket) => {
        console.log(`connected ID: ${socket.id}`)
        socket.on('disconnect', () => deleteGame(socket.data.userData))


        socket.on("setUserData", async (payload) => {
            const userData = await getUserDataByToken(payload.accessToken)
            if (userData != null) socket.data.userData = userData
        })


        // ----- GAME ----- //

        socket.on('createGame', (payload, callback) => {
            hostGame(socket, payload, callback, io)
        })


        socket.on('getActiveGames', (callback) => {
            getActiveGames(callback)
        })
        socket.on('joinInGame', (payload, callback) => {
            joinInGame(payload.gameId, socket, io, callback)

        })

        socket.on('quitGame', (payload) => {
            quitFromGame(payload, socket, io)
        })

        socket.on('changePlayerData', (payload) => {
            let game = FindGameInstanceById(payload.gameId)
            console.log(game)
            if (game == null) return
            game.changePlayerData(socket.data.userData.id, payload.newPlayerData)
        })

        socket.on('startGame', (payload) => {
            let game = FindGameInstanceById(payload.gameId)
            if (game == null) return
            game.emitStartGame(socket.data.userData.id)
        })

        socket.on('sendMessage', (payload) => {
            let game = FindGameInstanceById(payload.gameId)
            if (game == null) return
            game.sendMessage({
                ownerData: {
                    id: socket.data.userData.id,
                    name: socket.data.userData.name,
                },
                type: "message",
                message: payload.message
            })
        })

        socket.on('rollDice', (payload)=>{
            let game = FindGameInstanceById(payload.gameId)
            if (game == null) return
            game.rollDice(socket.data.userData, payload.DiceValue)
        })
    })
}

module.exports = {
    startSocket
}