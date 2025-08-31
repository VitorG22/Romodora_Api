const { Server } = require('socket.io')
const { GenerateRandomCode } = require('./scripts/randomCode')
const { getUserDataByToken } = require('./userFunctions/userData')
const { hostGame, logGames, deleteGame, getActiveGames, joinInGame, quitFromGame } = require('./game/functions')

function startSocket(server) {
    const io = new Server(server, {
        maxHttpBufferSize: 1e10,
        cors: { origin: '*' }
    })

    const rooms = io.of('/').adapter.rooms


    io.on('connection', (socket) => {
        console.log(`connected ID: ${socket.id}`)
        socket.on('disconnect', ()=> deleteGame(socket.data.userData))


        socket.on("setUserData", async(payload)=>{
            const userData = await getUserDataByToken(payload.accessToken)
            if(userData != null) socket.data.userData = userData
        })

        
        // ----- GAME ----- //
        
        socket.on('createGame', (payload, callback) => {
            hostGame(socket, payload, callback)
        })

        socket.on('teste', () => {
            // console.log('teste')
            // console.log(socket.data.userData)
            // logGames()
            console.log(rooms)
            // deleteGame(socket.data.userData)
        })

        socket.on('getActiveGames', (callback)=>{
            getActiveGames(callback)
        })
        socket.on('joinInGame', (payload,callback)=>{
            joinInGame(payload.gameId,socket, io, callback)
            
        })

        socket.on('quitGame', (payload)=>{
            quitFromGame(payload, socket, io)
        })
    })
}

module.exports = {
    startSocket
}