import { Server } from 'socket.io'
import { getUserDataByToken } from './userFunctions/userData.js'
import { FindGameInstanceById, hostGame, deleteGame, getActiveGames, joinInGame, quitFromGame } from './game/functions'
import { getMapById } from './mapCreationFunctions/mapDataBaseFunctions.js'
import type { Server as httpServer } from "http";
import type { ILayer } from './game/gameClass.js';

export function startSocket(server: httpServer) {
    const io = new Server(server, {
        maxHttpBufferSize: 1e10,
        cors: { origin: '*' }
    })

    io.on('connection', (socket) => {
        socket.on('disconnect', () => deleteGame({userId:socket.data.userData}))


        socket.on("setUserData", async (payload) => {
            const userData = await getUserDataByToken(payload.accessToken)
            if (userData != null) socket.data.userData = userData
        })


        // ----- GAME ----- //

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
            joinInGame({
                gameId: payload.gameId,
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
            let game = FindGameInstanceById({gameId:payload.gameId})
            if (game == null) return
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

        socket.on('sendMessage', (payload) => {
            let game = FindGameInstanceById({gameId:payload.gameId})
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

        socket.on('rollDice', (payload) => {
            let game = FindGameInstanceById({gameId:payload.gameId})
            if (game == null) return
            game.rollDice({
                DiceValue: payload.DiceValue,
                userData: socket.data.userData
            })
        })

        socket.on('changeSelectedMap', async (payload) => {
            let game = FindGameInstanceById({ gameId: payload.gameId })
            if (game == null || game.hostData.id != socket.data.userData.id) return

            let mapData = await getMapById(payload.mapId, socket.data.userData.id)
            if (mapData == null) return

            let mapDataParsed = { ...mapData, layers: (mapData.layers as unknown) as ILayer[] }

            game.changeSelectedMap({ mapData: mapDataParsed })
        })

        socket.on('changePlayerCharacterData', async (payload) => {
            let game = FindGameInstanceById({ gameId: payload.gameId })
            if (game == null) {
                console.log("return change playerData")
                return
            }

            game.changePlayerCharacterData({
                characterOwnerId: payload.characterOwnerId,
                newCharacterData: payload.newCharacterData,
                userId: socket.data.userData.id
            })
        })


    })
}
