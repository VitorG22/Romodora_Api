const { PrismaClient } = require('../generated/prisma/client.js')
const prisma = new PrismaClient()


async function getUserCharacters(req, res) {
    try {
        const charactersList = await prisma.character.findMany({
            where: {
                ownerId: req.user.userId
            }
        })

        let modedCharactersList = charactersList.map((characterData) => {
            return {
                name: characterData.name,
                id: characterData.id,
                picture: characterData.picture,
                class: characterData.class,
                subClass: characterData.subClass,
                race: characterData.race,
                subRace:characterData.subRace,
                attributes: {
                    strength: characterData.strength,
                    dexterity: characterData.dexterity,
                    constitution: characterData.constitution,
                    intelligence: characterData.intelligence,
                    wisdom: characterData.wisdom,
                    charisma: characterData.charisma,
                },
                level: characterData.level,
                life: characterData.life,
                maxLife: characterData.maxLife,
                position: { x: -1, y: -1 }
            }
        })

        res.status(200).json(modedCharactersList)

    } catch (error) {
        console.log(res)
        res.sendStatus(400)
    }
}

async function getCharacterById(req,res){
    try{
        const characterData = await prisma.character.findUnique({
            where:{
                id: req.params.characterId,
            }
        })

        if(characterData.ownerId != req.user.userId){
            res.sendStatus(403)
            return
        }

        res.status(200).json(
            {
                name: characterData.name,
                id: characterData.id,
                picture: characterData.picture,
                class: characterData.class,
                subClass: characterData.subClass,
                race: characterData.race,
                subRace:characterData.subRace,
                attributes: {
                    strength: characterData.strength,
                    dexterity: characterData.dexterity,
                    constitution: characterData.constitution,
                    intelligence: characterData.intelligence,
                    wisdom: characterData.wisdom,
                    charisma: characterData.charisma,
                },
                level: characterData.level,
                life: characterData.life,
                maxLife: characterData.maxLife,
                position: { x: -1, y: -1 }
            }
        )
    }catch(err){
        console.log(err)
        res.sendStatus(404)
    }
}

module.exports = {
    getUserCharacters,
    getCharacterById
}