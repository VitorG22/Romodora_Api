const { PrismaClient } = require('../generated/prisma/client')
const prisma = new PrismaClient()

async function deleteCharacter(req, res) {
    try {
        await prisma.character.delete({
            where: {
                id: req.body.characterId,
                ownerId: req.user.userId
            }
        })
        res.sendStatus(200)
    } catch (error) {
        console.log(error)
        res.sendStatus(403)
    }
}

module.exports = {
    deleteCharacter
}