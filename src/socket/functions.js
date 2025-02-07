const { GetCharacterById } = require("../routes/function/character")
const { GetJourneys } = require("../routes/function/journey")
const { GetUserByToken } = require("../routes/function/user")
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function setUserData(token, socket){
    const res = await GetUserByToken({token:token})
    if(res.status == 'fail') return
    const userData = res.result
    
    socket.data.userData = userData
}

async function initParty(body, socket, callback){
    const { token, journeyId} = body
    

    const res = await GetUserByToken({token:token})
    if(res.status == 'fail') {
        return
    }

    const userData = res.result
    closeParty(userData.id)

    let party;
    try{
        party = await prisma.partysOn.create({
            select:{
                id:true,
                party_journey:true
            },
            data:{
                
                journey_id: journeyId,
                host_id: userData.id
            }
        })
    }catch(err){
        return
    }
    
    
    const randomHexColorCode = () => {
        let n = (Math.random() * 0xfffff * 1000000).toString(16);
        return '#' + n.slice(0, 6);
    }
    userData.color = randomHexColorCode()
    socket.data.partyData ={
        partyCode:party.id,
        hostId: userData.id,
        players:[
            {
                ...userData,
                permissionType: 'host',
                characterData:{}
            }
        ],
        journeyData: party.party_journey,
        
    }
    callback()
}

async function IsThisUserPartyHost({partyCode, token}){
    try{
        const userData = await prisma.user.findFirstOrThrow({
            select:{
                id:true
            },
            where:{
                token:token
            }
        })

        const res = await prisma.partysOn.findFirstOrThrow({
            where:{
                host_id: userData.id,
                id: partyCode
            }
        })
        return true
    }catch(err){
        return false
    }
}

async function closeParty(userId){
    console.log('Close Party User',userId)
    try{

        const res = await prisma.partysOn.delete({
            where:{
                host_id: userId
            }
        })
    }catch(err){
        return
        
    }
}

async function setPlayer({partyData, data}, callback){
    try {
        
        const res = await prisma.user.findFirstOrThrow({
            select:{
                id:true,
                name:true,
                picture:true,
                email:true,
            },
            where:{
                id: data.userId
            }
        })

        const randomHexColorCode = () => {
            let n = (Math.random() * 0xfffff * 1000000).toString(16);
            return '#' + n.slice(0, 6);
        }


        res.color = randomHexColorCode()
        partyData.players.push({
            ...res,
            characterData:{},
            permissionType: 'player'
        })
        callback(partyData)

        
    } catch (err) {
        console.log(err)
        return
    }
}

async function leaveParty({partyData, data}, callback){
    try {
        
        const indexOfPlayerData = partyData.players.findIndex((playerData, index) => {if(playerData.id == data.userId)return index})
        if(indexOfPlayerData == -1)return
        partyData.players.splice(indexOfPlayerData, 1)
        callback(partyData)
        
    } catch (err) {
        console.log(err)
        return
    }
}

async function searchForParty({partyCode},callback){
    console.log(partyCode)
    try {
        let res = await prisma.partysOn.findFirst({
            select:{
                host_id:true
            },
            where:{
                id: partyCode
            }
        })
        if(!res){
            callback(false)
            return
        }
        callback(true)
        return 
        
    } catch (error) {
        console.log(error)
        callback(false)
        return
    }
}

async function setSelectedCharacter({partyData, data}, callBack){
    try{
        const res = await GetCharacterById({id: data.characterId})
        if(res.status =='fail'){throw new Error}
        
        const playerIndex = partyData.players.findIndex(element => element.id == data.userId)
        if(playerIndex == -1){throw new Error}

        partyData.players[playerIndex].characterData = res.result
        console.log(partyData.players[playerIndex])

        callBack(partyData)

    }catch(err){
        console.log(err)
        return
    }
}

async function updateMapMatrix({partyData,data}, callBack){
    let newPartyData = {
        ...partyData,
        mapData: data.newMapData
    }
    callBack(newPartyData)
}

async function trowDice(diceType, callBack){
    let trowResult = 0
    switch (diceType){
        case 'd100':
            trowResult = Math.ceil(Math.random() * 100)
        break
        case 'd20':
            trowResult = Math.ceil(Math.random() * 20)
        break
        case 'd12':
            trowResult = Math.ceil(Math.random() * 12)
        break
        case 'd10':
            trowResult = Math.ceil(Math.random() * 10)
        break
        case 'd8':
            trowResult = Math.ceil(Math.random() * 8)
        break
        case 'd6':
            trowResult = Math.ceil(Math.random() * 6)
        break
        case 'd4':
            trowResult = Math.ceil(Math.random() * 4)
        break
    }

    callBack(trowResult)
}

module.exports = {
    trowDice,
    setUserData,
    setPlayer,
    initParty,
    closeParty,
    leaveParty,
    setSelectedCharacter,
    IsThisUserPartyHost,
    updateMapMatrix,
    searchForParty
}