class Game{
    users; lobbyId; hostData;name;
    constructor({ io,name, users, lobbyId, hostData }) {
        this.hostData = hostData
        this.users = users
        this.lobbyId = lobbyId
        this.name = name
        this.tableData = {players: []}


        this.emitUpdateGame= () =>{
            io.to(`GameRoom:${this.lobbyId}`).emit('updateGameData', this)
        }
    
    }

    logLobbyID(){
        return this.lobbyId
    }

    changePlayerData(userId, newPlayerData){
        let playerIndex = this.tableData.players.findIndex(playerData => playerData.id == userId)

        if(playerIndex == -1)return

        this.tableData.players[playerIndex] = newPlayerData
        this.emitUpdateGame()
    }

}

module.exports = {
    Game
}