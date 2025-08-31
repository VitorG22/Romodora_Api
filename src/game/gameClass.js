class Game{
    users; lobbyId; hostId;name;
    constructor({ name, users, lobbyId, hostId }) {
        
        this.hostId = hostId
        this.users = users
        this.lobbyId = lobbyId
        this.name = name
    }

    logLobbyID(){
        console.log(this.lobbyId)
        return this.lobbyId
    }
    
}

module.exports = {
    Game
}