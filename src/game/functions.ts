import { nanoid } from 'nanoid'
import Game from './gameClass'
import type { Server, Socket } from 'socket.io';
import hashPassword from '../scripts/hashPassword';


let GamesInstancesList: Array<Game> = []

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


export async function hostGame({ socket, gameData, callback, io }: { socket: Socket, gameData: { name: string, onlyFriends: boolean, password?: string }, callback: (data: any) => void, io: Server }) {

    try {
        deleteGame(socket.data.userData.id)

        let playersList = []
        playersList.push({ ...socket.data.userData, color: getRandomColor() })

        console.log(gameData)
        let newGame = new Game({
            io: io,
            name: gameData.name,
            hostData: socket.data.userData,
            lobbyId: nanoid(6),
            users: playersList,
            onlyFriends: gameData.onlyFriends || false,
            password: gameData.password ? (hashPassword(gameData.password)) : (undefined)
        })

        GamesInstancesList.push(newGame)

        socket.join(`GameRoom:${newGame.lobbyId}`)
        callback({
            status: 200,
            gameData: newGame
        }
        )
    } catch (error) {
        console.log(error)
    }
}

export function deleteGame({ userId }: { userId: string | undefined }) {

    if (!userId) { return }
    try {
        let gameInstanceIndex = GamesInstancesList.findIndex(gameData => gameData.hostData.id == userId)
        if (gameInstanceIndex != -1) {
            GamesInstancesList.splice(gameInstanceIndex, 1)
        }
    } catch (err) {
        console.log(err)
    }
}

export async function getActiveGames({ callback }: { callback: (data: any) => void }) {

    try {

        let activeGamesList = GamesInstancesList.map(gameData => {
            return {
                id: gameData.lobbyId,
                name: gameData.name,
                game_host: gameData.hostData,
                users: gameData.users,
                onlyFriends: gameData.onlyFriends,
                hasPassword: !!gameData.password
            }
        })

        callback({ status: 200, activeGamesList: activeGamesList })


    } catch (error) {
        console.log(error)
        callback({ status: 400, activeGamesList: null })
    }
}

export function joinInGame({ gameId, socket, callback, password }: { gameId: string, socket: Socket, password: string | undefined, callback: (data: any) => void }) {
    let game = FindGameInstanceById({ gameId: gameId })
    let randomColor = getRandomColor()

    if (!game) {
        callback({ status: 400, message: 'Game Not Found' })
        return
    }

    if (game.password != undefined && game.password != password) {
        callback({ status: 400 , message: 'Incorrect Password'})
        return
    }


    game.users.push({ ...socket.data.userData, color: randomColor })
    game.tableControl.players.push({ ...socket.data.userData, character: null, color: randomColor })

    let gameCopy = { ...game }
    delete gameCopy.password
    socket.join(`GameRoom:${game.lobbyId}`)
    callback({ status: 200, gameData: gameCopy })

    game.playerJoin(socket.data.userData.id)
}

export function quitFromGame({ gameId, socket }: { gameId: string, socket: Socket }) {
    socket.leave(`GameRoom:${gameId}`)
    let game = FindGameInstanceById({ gameId })
    if (!game) {
        return
    }
    if (game.hostData.id == socket.data.userData.id) {
        deleteGame({ userId: socket.data.userData.id })
        return
    }

    let userIndex = game.users.findIndex(userData => userData.id == socket.data.userData.id)
    game.users.splice(userIndex, 1)

    let playerIndex = game.tableControl.players.findIndex(playerData => playerData.id == socket.data.userData.id)
    game.tableControl.players.splice(playerIndex, 1)

    game.playerLeave(socket.data.userData.id)
}

export function FindGameInstanceById({ gameId }: { gameId: string }) {
    let game = GamesInstancesList.find((gameData) => gameData.lobbyId == gameId)
    return game
}
