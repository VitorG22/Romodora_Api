import type { Server } from "socket.io";
import { FindGameInstanceById } from "../game/functions";
import { FindEntityById, UserHavePermissionToChangeCharacterData } from "../game/entity/entityFunctions";

export default function startEntitySocket(io: Server) {

    io.on('connection', (socket) => {
        socket.on('changePlayerSelectedCharacter', async (payload) => {
            let game = FindGameInstanceById({ gameId: payload.gameId })
            if (game == null) {
                return
            }

            game.changePlayerSelectedCharacter({
                characterOwnerId: payload.characterOwnerId,
                newCharacterData: payload.newCharacterData,
                userId: socket.data.userData.id
            })
        })

        socket.on('entity_move', payload => {
            let game = FindGameInstanceById({ gameId: payload.gameId })
            if (game == undefined) return
            let entity = FindEntityById({ gameInstance: game, entityId: payload.entityId })
            
            entity?.changePosition({gameInstance: game, x:payload.position.x, y: payload.position.y})
            console.log(payload)

        })

        socket.on('entity_heal', payload => {
            let game = FindGameInstanceById({ gameId: payload.gameId })
            if (game == undefined) return
            let entity = FindEntityById({ gameInstance: game, entityId: payload.entityId })
            entity?.heal(payload.healValue)
        })

        socket.on('entity_damage', payload => {
            let game = FindGameInstanceById({ gameId: payload.gameId })
            if (game == undefined) return
            let entity = FindEntityById({ gameInstance: game, entityId: payload.entityId })
            entity?.damage(payload.healValue)
        })

        socket.on('entity_changeAttribute', payload => {
            let game = FindGameInstanceById({ gameId: payload.gameId })
            if (game == undefined) return

            let entity = FindEntityById({ gameInstance: game, entityId: payload.entityId })
            if (entity == undefined) return

            if (UserHavePermissionToChangeCharacterData({ gameInstance: game, userId: socket.data.userData.id, character: entity })) {
                entity.changeAttribute({
                    attribute: payload.attribute,
                    value: payload.value
                })
            }
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