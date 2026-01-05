import type { Server } from "socket.io";
import { FindGameInstanceById } from "../game/functions";

export default function startEntitySocket(io: Server) {

    io.on('connection', (socket) => {
        socket.on('changePlayerCharacterData', async (payload) => {
            let game = FindGameInstanceById({ gameId: payload.gameId })
            if (game == null) {
                return
            }

            game.changePlayerCharacterData({
                characterOwnerId: payload.characterOwnerId,
                newCharacterData: payload.newCharacterData,
                userId: socket.data.userData.id
            })
        })

        socket.on('ChangeItemData', (payload) => {
            let game = FindGameInstanceById({ gameId: payload.gameId })
            if (game == null) {
                return
            }

            let item = game.getItemById(payload.subSelectionId)
            if (!item) return

            item.amount = payload.amount || item.amount
            item.price = payload.price || item.price

            game.emitUpdateTable({
                TypeToChange: "item",
                data: item
            })


        })


    })


}