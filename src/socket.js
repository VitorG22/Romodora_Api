const { Server } = require('socket.io')
const { GenerateRandomCode } = require('./scripts/randomCode')
const { getUserDataByToken } = require('./userFunctions/userData')
const { FindGameInstanceById, hostGame, logGames, deleteGame, getActiveGames, joinInGame, quitFromGame } = require('./game/functions')
const { getMapById } = require('./mapCreationFunctions/mapDataBaseFunctions')

function startSocket(server) {
    const io = new Server(server, {
        maxHttpBufferSize: 1e10,
        cors: { origin: '*' }
    })



    io.on('connection', (socket) => {
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

        socket.on('changeSelectedMap', async(payload)=>{
            let game = FindGameInstanceById(payload.gameId)
            if (game == null ||game.hostData.id != socket.data.userData.id) return
            
            let mapData = await  getMapById(payload.mapId,socket.data.userData.id)
            if(mapData == null)return

            console.log(payload.mapId)
            game.changeSelectedMap(mapData)
        })

        socket.on('changePlayerCharacterData', async(payload)=>{
            let game = FindGameInstanceById(payload.gameId)
            if (game == null) {return}

            game.changePlayerCharacterData(payload, socket.data.userData.id)
        })


    })
}

module.exports = {
    startSocket
}