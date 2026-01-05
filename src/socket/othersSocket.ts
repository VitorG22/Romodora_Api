import type { Server } from "socket.io";
import { FindGameInstanceById } from "../game/functions";
import { getMapById } from "../mapCreationFunctions/mapDataBaseFunctions";
import type { ILayer } from "../game/gameClass";

export default function startOtherSocket(io: Server) {

    io.on("connection", (socket) => {
        socket.on('sendMessage', (payload) => {
            let game = FindGameInstanceById({ gameId: payload.gameId })
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
            let game = FindGameInstanceById({ gameId: payload.gameId })
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

    })
}