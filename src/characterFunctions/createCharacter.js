const { PrismaClient } = require('../generated/prisma/client.js')
const prisma = new PrismaClient()

async function EditCharacter(req, res) {

    let characterData = req.body
    try {
        await prisma.character.upsert({
            where:{id: characterData.id},
            create: {
                class: characterData.class,
                level: characterData.level,
                life: parseInt(characterData.life),
                maxLife: parseInt(characterData.maxLife),
                name: characterData.name,
                picture: characterData.picture,
                race: characterData.race,
                subClass: characterData.subClass,
                subRace: characterData.subRace,
                charisma: parseInt(characterData.attributes.charisma),
                constitution: parseInt(characterData.attributes.constitution),
                dexterity: parseInt(characterData.attributes.dexterity),
                intelligence: parseInt(characterData.attributes.intelligence),
                strength: parseInt(characterData.attributes.strength),
                wisdom: parseInt(characterData.attributes.wisdom),
                ownerId: req.user.userId
            },
            update:{
                class: characterData.class,
                level: characterData.level,
                life: parseInt(characterData.life),
                maxLife: parseInt(characterData.maxLife),
                name: characterData.name,
                picture: characterData.picture,
                race: characterData.race,
                subClass: characterData.subClass,
                subRace: characterData.subRace,
                charisma: parseInt(characterData.attributes.charisma),
                constitution: parseInt(characterData.attributes.constitution),
                dexterity: parseInt(characterData.attributes.dexterity),
                intelligence: parseInt(characterData.attributes.intelligence),
                strength: parseInt(characterData.attributes.strength),
                wisdom: parseInt(characterData.attributes.wisdom),
            }
        })


        res.sendStatus(200)
    } catch (err) {
        console.log(err)
        res.sendStatus(400)
    }

}


module.exports = {
    EditCharacter
}