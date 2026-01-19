import type { Server } from "socket.io";
import generateRandomCode from "../scripts/randomCode";
import { Character, type ICharacter, type TEntity } from "./entity/entityclass";

interface IGame {
    users: Array<{
        email: string,
        name: string,
        id: string,
        picture: string,
        color: string
    }>
    lobbyId: string
    hostData: {
        email: string
        name: string
        id: string
        picture: string
    }
    name: string
    io: Server
    password: string | undefined
    onlyFriends: boolean
}


interface ITableControl {
    lobbyId: string,
    players: Array<{
        email: string,
        name: string,
        id: string,
        picture: string,
        color: string
        character?: Character
    }>,
    tableMap: ITableMap | undefined
};

interface ITableMap {
    image?: string
    id?: string
    description?: string
    name: string,
    lastModify?: Date
    sizeX: number
    sizeY: number
    layers?: Array<ILayer>;
    selectedLayer?: string
}

export interface ILayer {
    id: string;
    matrix: {
        x: number
        y: number
        type: 'void' | 'floor' | "wall" | "entity"
        direction: 'top' | 'left' | 'bottom' | 'right'
        tileData: {
            name: string,
            path: string,
            size: { x: number, y: number }
            group: string
        } | null
        linkData: {
            isMainTile: boolean
            mainTilePosition: { x: number, y: number }
            groupPositions: { x: number, y: number }[]
        }[][];
        name: string;
        show: boolean;
    }
}

export default class Game {
    users; lobbyId; hostData; name; onlyFriends; password?; emitUpdateGame; emitUpdateTable; emitAction; playerJoin; playerLeave;
    chat: Array<{
        ownerData: {
            id: string,
            name: string
        },
        type: "message" | "system",
        message: string
    }> = [];
    tableControl: ITableControl

    constructor({ io, name, users, lobbyId, hostData, onlyFriends, password }: IGame) {
        this.hostData = hostData
        this.onlyFriends = onlyFriends
        this.users = users
        this.lobbyId = lobbyId
        this.name = name
        this.password = password
        this.tableControl = {
            lobbyId: lobbyId,
            players: [],
            tableMap: undefined
        }
        this.chat = []


        this.emitUpdateGame = (data: any) => {
            io.to(`GameRoom:${this.lobbyId}`).emit('updateGameData', data)
        }

        this.emitUpdateTable = (data: any) => {
            io.to(`GameRoom:${this.lobbyId}`).emit('updateTableData', data)
        }

        this.emitAction = (action: string) => {
            io.to(`GameRoom:${this.lobbyId}`).emit(action)
        }


        this.playerJoin = (userId: string) => {
            let userData = this.users.find(user => user.id == userId)
            if (!userData) return

            io.to(`GameRoom:${this.lobbyId}`).emit('playerJoin', userData)
        }

        this.playerLeave = (userId: string) => {
            io.to(`GameRoom:${this.lobbyId}`).emit('playerLeave', userId)
        }
    }

    sendMessage(data: {
        ownerData: {
            id: string,
            name: string
        },
        type: "message" | "system",
        message: string
    }) {
        this.chat.push(data)
        this.emitUpdateGame({ chat: this.chat })
    }

    logLobbyID() {
        return this.lobbyId
    }

    changePlayerData({ userId, newPlayerData }: {
        userId: string, newPlayerData: {
            email: string,
            name: string,
            id: string,
            picture: string,
            color: string
            character?: Character
        }
    }) {
        let playerIndex = this.tableControl.players.findIndex(playerData => playerData.id == userId)

        if (playerIndex == -1) return

        this.tableControl.players[playerIndex] = newPlayerData



        this.emitUpdateTable({
            TypeToChange: "player",
            data: {
                playerData: this.tableControl.players[playerIndex]
            }
        })


    }

    changePlayerSelectedCharacter({ newCharacterData, characterOwnerId, userId }: { newCharacterData: ICharacter, characterOwnerId: string, userId: string }) {
        let playerOwner = this.tableControl.players.find(playerData => playerData.id == characterOwnerId)
        if (!playerOwner) return
        if (this.hostData.id != userId && playerOwner.id != userId) return

        if (newCharacterData.inventory) {
            newCharacterData.inventory.forEach(item => item.subSelectionId = item.subSelectionId || generateRandomCode(32))
        }

        playerOwner.character = new Character({
            ...newCharacterData, emitChange: (characterData: TEntity) => this.emitUpdateTable({
                TypeToChange: "character",
                data: {
                    userId: playerOwner.id,
                    characterData: characterData
                }
            })
        })

        this.emitUpdateTable({
            TypeToChange: "character",
            data: {
                userId: playerOwner.id,
                characterData: playerOwner.character
            }
        })
    }


    changeSelectedMap({ mapData }: { mapData: ITableMap }) {
        this.tableControl.tableMap = mapData
        this.emitUpdateTable({
            TypeToChange: "tableMap",
            data: this.tableControl.tableMap
        })

    }


    emitStartGame({ userId }: { userId: string }) {
        if (this.hostData.id != userId) return

        let isAllPlayersRead = true
        this.tableControl.players.forEach(playerData => { if (playerData.character == null) isAllPlayersRead = false })

        if (isAllPlayersRead) {
            this.emitAction('startGame')
        }
    }

    rollDice({ userData, DiceValue }: {
        userData: {
            email: string,
            name: string,
            id: string,
            picture: string,
            color: string
        }, DiceValue: number
    }) {
        let randomValue = Math.floor(Math.random() * DiceValue) + 1
        this.sendMessage({
            ownerData: {
                id: userData.id,
                name: userData.name,
            },
            type: "system",
            message: `${userData.name} roll ${randomValue} in D${DiceValue}`
        })
    }

    getEntityById(EntityId: string) {
        let EntityToReturn = undefined

        this.tableControl.players.forEach(playerData => {
            if (playerData.character?.id == EntityId) {
                EntityToReturn = playerData.character!
            }
        })

        return EntityToReturn
    }

    getItemById(ItemSubSelectionId: string) {
        let itemToReturn: any;

        for (let playerData of this.tableControl.players) {
            playerData.character?.inventory.forEach(itemData => {
                if (itemData.subSelectionId == ItemSubSelectionId) {
                    itemToReturn = itemData
                }
            })
        }


        return itemToReturn
    }
}