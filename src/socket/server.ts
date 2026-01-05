import { Server } from 'socket.io'
import { getUserDataByToken } from '../userFunctions/userData.js'
import { deleteGame } from '../game/functions.js'
import type { Server as httpServer } from "http";
import startLobbySocket from './lobbySocket.js';
import startOtherSocket from './othersSocket.js';
import startEntitySocket from './entitySocket.js';

export function startSocket(server: httpServer) {
    const io = new Server(server, {
        maxHttpBufferSize: 1e10,
        cors: { origin: '*' }
    })

    startLobbySocket(io)
    startEntitySocket(io)
    startOtherSocket(io)

    
    io.on('connection', (socket) => {
        socket.on('disconnect', () => deleteGame({userId:socket.data.userData}))


        socket.on("setUserData", async (payload) => {
            const userData = await getUserDataByToken(payload.accessToken)
            if (userData != null) socket.data.userData = userData
        })

    })
}
