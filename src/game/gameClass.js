class Game {
    users; lobbyId; hostData; name;
    constructor({ io, name, users, lobbyId, hostData }) {
        this.hostData = hostData
        this.users = users
        this.lobbyId = lobbyId
        this.name = name
        this.tableControl = {
            lobbyId: lobbyId,
            players: [],
            tableMap: null
        }
        this.chat = []


        this.emitUpdateGame = (data) => {
            io.to(`GameRoom:${this.lobbyId}`).emit('updateGameData', data)
        }

        this.emitUpdateTable = (data) => {
            io.to(`GameRoom:${this.lobbyId}`).emit('updateTableData', data)
        }

        this.emitAction = (action) => {
            io.to(`GameRoom:${this.lobbyId}`).emit(action)
        }


        this.playerJoin = (userId) => {
            let userData = this.users.find(user => user.id == userId)
            if (!userData) return

            io.to(`GameRoom:${this.lobbyId}`).emit('playerJoin', userData)
        }

        this.playerLeave = (userId) => {
            io.to(`GameRoom:${this.lobbyId}`).emit('playerLeave', userId)
        }
    }

    sendMessage(data) {
        this.chat.push(data)
        this.emitUpdateGame({ chat: this.chat })
    }

    logLobbyID() {
        return this.lobbyId
    }

    changePlayerData(userId, newPlayerData) {
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

    changePlayerCharacterData({ newCharacterData, characterOwnerId }, userId) {
        let playerOwner = this.tableControl.players.find(playerData => playerData.id == characterOwnerId)
        if (this.hostData.id != userId && playerOwner.id != userId) return

        playerOwner.character = { ...playerOwner.character, ...newCharacterData }

        this.emitUpdateTable({
            TypeToChange: "character",
            data: {
                userId: playerOwner.id,
                characterData: playerOwner.character
            }
        })
    }


    changeSelectedMap(mapData) {
        this.tableControl.tableMap = mapData
        this.emitUpdateTable({
            TypeToChange: "tableMap",
            data: this.tableControl.tableMap
        })

    }


    emitStartGame(userId) {
        if (this.hostData.id != userId) return

        let isAllPlayersRead = true
        this.tableControl.players.forEach(playerData => { if (playerData.character == null) isAllPlayersRead = false })

        if (isAllPlayersRead) {
            this.emitAction('startGame')
        }
    }

    rollDice(userData, DiceValue) {
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
}

module.exports = {
    Game
}