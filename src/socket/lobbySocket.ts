import type { Socket } from "socket.io";
import { Server } from 'socket.io'
import { FindGameInstanceById, getActiveGames, hostGame, joinInGame, quitFromGame } from "../game/functions";
import hashPassword from "../scripts/hashPassword";

export default function startLobbySocket(io: Server){
    io.on('connection', (socket: Socket) => {

        socket.on('createGame', (payload, callback) => {
            hostGame({
                callback: callback,
                gameData: payload,
                io: io,
                socket: socket
            })
        })


        socket.on('getActiveGames', (callback) => {
            getActiveGames({ callback: callback })
        })

        socket.on('joinInGame', (payload, callback) => {
            console.log(payload)
            joinInGame({
                gameId: payload.gameId,
                password: payload.password ? hashPassword(payload.password):undefined ,
                socket: socket,
                callback: callback
            })
        })

        socket.on('quitGame', (payload) => {
            quitFromGame({
                gameId: payload.gameId,
                socket: socket
            })
        })

        socket.on('changePlayerData', (payload) => {
            let game = FindGameInstanceById({ gameId: payload.gameId })
            if (game == null) return
            console.log("teste_123")
            game.changePlayerData({
                newPlayerData: payload.newPlayerData,
                userId: socket.data.userData.id,
            })
        })


        socket.on('startGame', (payload) => {
            let game = FindGameInstanceById({gameId:payload.gameId})
            if (game == null) { return }
            game.emitStartGame({userId:socket.data.userData.id})
        })
    })

}