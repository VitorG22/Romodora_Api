class Game{
    users; lobbyId; hostData;name;
    constructor({ io,name, users, lobbyId, hostData }) {
        this.hostData = hostData
        this.users = users
        this.lobbyId = lobbyId
        this.name = name
        this.tableData = {players: []}
        this.chat = []

        
        this.emitUpdateGame = (data) => {
            io.to(`GameRoom:${this.lobbyId}`).emit('updateGameData', data)
        }

        this.emitUpdateTable = (data) =>{
            io.to(`GameRoom:${this.lobbyId}`).emit('updateTableData', data)
        }

        this.emitAction = (action) =>{
            io.to(`GameRoom:${this.lobbyId}`).emit(action)
        }

    }

    sendMessage(data){
        console.log(data)
        this.chat.push(data)
        this.emitUpdateGame({chat: this.chat})
    }

    logLobbyID(){
        return this.lobbyId
    }

    changePlayerData(userId, newPlayerData){
        let playerIndex = this.tableData.players.findIndex(playerData => playerData.id == userId)

        if(playerIndex == -1)return

        this.tableData.players[playerIndex] = newPlayerData
        this.emitUpdateGame({
            tableData: this.tableData
        })
    }

    emitStartGame(userId){
        if(this.hostData.id != userId)return

        let isAllPlayersRead = true
        this.tableData.players.forEach(playerData => {if(playerData.character == null) isAllPlayersRead = false})

        if(isAllPlayersRead){
            this.emitAction('startGame')      
        }
    }

}

module.exports = {
    Game
}