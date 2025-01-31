const { PrismaClient, Prisma } = require('@prisma/client')
const prisma = new PrismaClient()

function ConcatScorePoints(data) {
    const habilityPointString = `${data.baseScore}/${data.modifier}/${data.setScore}/${data.bonus}/${data.stackingBonus}/${data.totalScore}`
    return habilityPointString
}

function disconcatePoints(string) {

    const valuesArray = string.split('/')
    let abilityPoints = {
        baseScore: parseInt(valuesArray[0]),
        modifier: parseInt(valuesArray[1]),
        setScore: parseInt(valuesArray[2]),
        bonus: parseInt(valuesArray[3]),
        stackingBonus: parseInt(valuesArray[4]),
        totalScore: parseInt(valuesArray[5]),
    }
    return abilityPoints
}

function concatHealth(healthData) {
    const healthString = `${healthData.maxHealthTotal}/${healthData.maxHealthBase}/${healthData.maxHealthBonus}/${healthData.currentHealth}/${healthData.currentHealthBonus}`
    return healthString
}
function disconcateHealth(healthString) {
    const valuesArray = healthString.split('/')
    let health = {
        maxHealthTotal: valuesArray[0],
        maxHealthBase: valuesArray[1],
        maxHealthBonus: valuesArray[2],
        currentHealth: valuesArray[3],
        currentHealthBonus: valuesArray[4]
    }
    return health
}



async function GetCharacters({ token }) {
    try {
        const res = await prisma.character.findMany({
            select: {
                id: true,
                name: true,
                picture: true,
                class: true,
                bag: true,
                subClass: true,
                race: true,
                subRace: true,
                charisma: true,
                constitution: true,
                dexterity: true,
                intelligence: true,
                strength: true,
                wisdom: true,
                health: true
            },
            where: {
                character_owner: {
                    token: token
                }
            }
        })
        let characterList = []
        if (res != []) {
            res.forEach(element => {
                characterList.push({
                    id: element.id,
                    name: element.name,
                    picture: element.picture,
                    race: element.race,
                    subRace: element.subRace,
                    class: element.class,
                    subClass: element.subClass,
                    health: disconcateHealth(element.health),
                    bag: element.bag,
                    abilityScores: {
                        strength: disconcatePoints(element.strength),
                        dexterity: disconcatePoints(element.dexterity),
                        constitution: disconcatePoints(element.constitution),
                        intelligence: disconcatePoints(element.intelligence),
                        wisdom: disconcatePoints(element.wisdom),
                        charisma: disconcatePoints(element.charisma),
                    }
                })
            })
        }

        return ({
            status: 'success',
            result: characterList
        })
    } catch (err) {
        return ({
            status: 'fail',
            message: 'Error Search for Characters'
        })
    }
}

async function GetCharacterById({ id }) {
    try {
        const res = await prisma.character.findUniqueOrThrow({
            select: {
                id: true,
                name: true,
                picture: true,
                class: true,
                bag: true,
                subClass: true,
                race: true,
                subRace: true,
                charisma: true,
                constitution: true,
                dexterity: true,
                intelligence: true,
                strength: true,
                wisdom: true,
                health: true
            },
            where: {
                id: id
            }
        })
        let characterData = {
            id: res.id,
            name: res.name,
            picture: res.picture,
            race: res.race,
            subRace: res.subRace,
            class: res.class,
            subClass: res.subClass,
            health: disconcateHealth(res.health),
            bag: res.bag,
            abilityScores: {
                strength: disconcatePoints(res.strength),
                dexterity: disconcatePoints(res.dexterity),
                constitution: disconcatePoints(res.constitution),
                intelligence: disconcatePoints(res.intelligence),
                wisdom: disconcatePoints(res.wisdom),
                charisma: disconcatePoints(res.charisma),
            }
        }



        return ({
            status: 'success',
            result: characterData
        })
    } catch (err) {
        return ({
            status: 'fail',
            message: 'Error Search for Character'
        })
    }
}

async function CreateCharacter(body) {
    try {
        const userData = await prisma.user.findFirst({
            select: { id: true },
            where: { token: body.token }
        })

        await prisma.character.create({
            data: {
                charisma: ConcatScorePoints(body.characterData.abilityScores.charisma),
                constitution: ConcatScorePoints(body.characterData.abilityScores.constitution),
                dexterity: ConcatScorePoints(body.characterData.abilityScores.dexterity),
                intelligence: ConcatScorePoints(body.characterData.abilityScores.intelligence),
                strength: ConcatScorePoints(body.characterData.abilityScores.strength),
                wisdom: ConcatScorePoints(body.characterData.abilityScores.wisdom),
                race: body.characterData.race,
                subRace: body.characterData.subRace,
                class: body.characterData.class,
                name: body.characterData.name,
                picture: body.characterData.picture,
                bag: '',
                health: concatHealth(body.characterData.health),
                owner: userData.id,
                subClass: body.characterData.subClass
            }
        })

        return ({ status: 'success', })

    } catch (err) {
        return ({
            status: 'fail',
            message: 'Fail on Create Character'
        })
    }
}

async function UpdateCharacter(body) {
    try {
        const userData = await prisma.user.findFirst({
            select: { id: true },
            where: { token: body.token }
        })

        await prisma.character.update({
            where:{
                id: body.characterData.id
            },
            data: {
                charisma: ConcatScorePoints(body.characterData.abilityScores.charisma),
                constitution: ConcatScorePoints(body.characterData.abilityScores.constitution),
                dexterity: ConcatScorePoints(body.characterData.abilityScores.dexterity),
                intelligence: ConcatScorePoints(body.characterData.abilityScores.intelligence),
                strength: ConcatScorePoints(body.characterData.abilityScores.strength),
                wisdom: ConcatScorePoints(body.characterData.abilityScores.wisdom),
                race: body.characterData.race,
                subRace: body.characterData.subRace,
                class: body.characterData.class,
                name: body.characterData.name,
                picture: body.characterData.picture,
                bag: '',
                health: concatHealth(body.characterData.health),
                owner: userData.id,
                subClass: body.characterData.subClass
            }
        })

        return ({ status: 'success', })

    } catch (err) {
        return ({
            status: 'fail',
            message: 'Fail on Create Character'
        })
    }
}

async function DeleteCharacter(body){
    try {
        const userData = await prisma.user.findFirst({
            select: { id: true },
            where: { token: body.token }
        })

        const deleteResult = await prisma.character.delete({
            where:{
                id:body.characterData.id,
                owner:userData.id
            }
        })

        

        return GetCharacters({token: body.token})

    } catch (err) {
        return ({
            status: 'fail',
            message: 'Fail on Create Character'
        })
    }
}



module.exports = {
    GetCharacters,
    GetCharacterById,
    CreateCharacter,
    UpdateCharacter,
    DeleteCharacter
}