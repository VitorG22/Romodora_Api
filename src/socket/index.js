
const { Server } = require('socket.io')
const { app } = require('../routes/index')
const { searchForParty, setUserData, initParty, closeParty, setPlayer, trowDice, leaveParty, setSelectedCharacter, IsThisUserPartyHost, startGame, updateMapMatrix } = require('./functions')
const { GetCharacterById } = require('../routes/function/character')
const server = require('http').createServer(app)
const io = new Server(server, {
        maxHttpBufferSize: 1e10,
        cors: { origin: '*' }
})

const PORT = process.env.PORT ?? 3001


io.on('connection', (socket) => {
        console.log('connected')

        //----- User Functions -----//

        socket.on('disconnect', (e) => {

                console.log('disconnect')

                try {
                        if (!socket?.data?.userData?.id) return
                        closeParty(socket.data.userData.id)
                        io.emit(`requestPartyData_${socket?.data?.partyData?.partyCode}`, {
                                subFunction: 'leaveParty',
                                data: {
                                        userId: socket?.data?.userData?.id
                                }
                        })
                } catch (err) {
                        return
                }
        })

        socket.on('setUserData', (body) => {
                setUserData(body.token, socket)
        })


        //----- Party Function -----//

        socket.on('initParty', (body) => {
                initParty(body, socket, () => {
                        const userData = socket.data.userData
                        console.log(`hostParty_${userData.name}`)
                        io.emit(`hostParty_${userData.id}`, socket.data.partyData)
                })
        })
        socket.on('deleteParty', body => {
                io.emit(`partyDeleted_${body.partyCode}`)
                closeParty(body.userId)
        })
        socket.on(`setPartyData`, (body) => {
                io.emit(`setPartyData_${body.partyData.partyCode}`, body)
        })

        socket.on('partyStart', async (body) => {
                console.log(body)
                let isThisUserPartyHost = await IsThisUserPartyHost({
                        partyCode: body.partyCode,
                        token: body.token
                })
                console.log(isThisUserPartyHost)
                if (isThisUserPartyHost) {
                        io.emit(`partyStart_${body.partyCode}`)
                }

        })

        socket.on('connectionRequest', async (body) => {
                await searchForParty(body, (partyExist) => {
                        if (partyExist) {
                                socket.data.partyData = {
                                        partyCode: body.partyCode
                                }
                                io.emit(`connectionRequest_${body.partyCode}`, {
                                        userId: socket.data.userData.id
                                })
                        } else {
                                io.emit(`connectionRequestRejected_${socket.data.userData.id}`)
                        }
                })
        })
        socket.on('connectionRequestAccepted', body => {
                io.emit(`connectionRequestAccepted_${body.userId}`, { partyData: body.partyData })
        })



        socket.on('setPlayer', body => {
                io.emit(`requestPartyData_${body.partyCode}`, {
                        subFunction: 'setPlayer',
                        data: { userId: body.userId }
                })
        })
        socket.on('requestedPartyData/setPlayer', body => {
                setPlayer(body, (data) => {
                        io.emit(`setPartyData_${body.partyData.partyCode}`, { partyData: data })
                })
        })


        socket.on('leaveParty', body => {
                io.emit(`requestPartyData_${body.partyCode}`, {
                        subFunction: 'leaveParty',
                        data: {
                                userId: socket?.data?.userData?.id
                        }
                })
        })
        socket.on('requestedPartyData/leaveParty', body => {
                leaveParty(body, (data) => {
                        io.emit(`setPartyData_${body.partyData.partyCode}`, { partyData: data })
                })
        })


        socket.on('setSelectedCharacter', async (body) => {
                console.log(body)
                let getCharacterResult = await GetCharacterById({ id: body.characterId })
                if (getCharacterResult.status != 'success') return

                io.emit(`setSelectedCharacter_${body.partyCode}`, {
                        characterData: getCharacterResult.result,
                        userId: socket?.data?.userData?.id
                })

        })

        socket.on('setMapMatrix', body => {
                io.emit(`setMapMatrix_${body.partyCode}`, {
                        newMapData: body.newMapData
                })
        })


        socket.on('chatMessage', body => {
                console.log(body)
                io.emit(`chatMessage_${body.partyCode}`, {
                        type: 'userMessage',
                        message: body.message,
                        ownerId: socket.data.userData.id

                })
        })

        socket.on('trowDice', async (body) => {
                await trowDice(body.diceType, (trowResult) => {
                        console.log(trowResult)
                        io.emit(`chatMessage_${body.partyCode}`, {
                                type: 'systemMessage',
                                message: `${body.characterName || "Dungeon Master"} Row ${trowResult} in ${body.diceType}`,
                                ownerId: socket.data.userData.id
                        })

                })
        })

        socket.on('mobAction', (body)=>{
                io.emit(`mobAction_${body.partyCode}`, body.data)
        })

        
        socket.on('sendSticker', (body)=>{
                io.emit(`sendSticker_${body.partyCode}`, body.data)
        })

})


server.listen(PORT, () => console.log('Server is running in PORT:', PORT))