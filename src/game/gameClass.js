class Game{
    users; lobbyId; hostData;name;
    constructor({ io,name, users, lobbyId, hostData }) {
        this.hostData = hostData
        this.users = users
        this.lobbyId = lobbyId
        this.name = name
        this.tableData = {players: []}


        this.emitUpdateGame= (data) =>{
            io.to(`GameRoom:${this.lobbyId}`).emit('updateGameData', data)
        }
    
    }

    logLobbyID(){
        return this.lobbyId
    }

    changePlayerData(userId, newPlayerData){
        let playerIndex = this.tableData.players.findIndex(playerData => playerData.id == userId)

        if(playerIndex == -1)return

        this.tableData.players[playerIndex] = newPlayerData
        this.emitUpdateGame({tableData: this.tableData})
    }

}

module.exports = {
    Game
}