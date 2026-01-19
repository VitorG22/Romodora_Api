import type Game from "../gameClass";
import type { Character } from "./entityclass";

export function FindEntityById({ gameInstance, entityId }: { gameInstance: Game, entityId: string }) {

    for (let player of gameInstance.tableControl.players) {
        if (player.character?.id == entityId) {
            return player.character
        }
    }

    return undefined    
}

export function FindOwnerByEntityId({gameInstance, entityId}:{gameInstance:Game, entityId:string}){
    for (let player of gameInstance.tableControl.players) {
        if (player.character?.id == entityId) {
            return player
        }
    }
    return undefined    
}

export function UserHavePermissionToChangeCharacterData({character,userId,gameInstance}:{character:Character, userId: string, gameInstance:Game}){
    let entityOwner = FindOwnerByEntityId({
        gameInstance:gameInstance,
        entityId: character.id 
    })

    if(!entityOwner)return false

    if(userId == gameInstance.hostData.id || userId == entityOwner.id)return true

    return false
    
}
    