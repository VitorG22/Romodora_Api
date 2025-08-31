const { PrismaClient } = require('../generated/prisma/client');
const { hashPassword } = require('../scripts/hashPassword');
const prisma = new PrismaClient();

async function changeUserData(req, res) {

    try {
        const userData = await prisma.user.findUniqueOrThrow({ where: { id: req.user.userId } })

        if (userData.password != hashPassword(req.body.password)) {
            res.status(400).json('incorrect Password')
            return
        }


        let newPassword = undefined
        if (req.body.newPassword) {newPassword = hashPassword(req.body.newPassword) }
        await prisma.user.update({
            where: {
                id: req.user.userId,
            },
            data: {
                name: req.body.newUserName || userData.name,
                password: newPassword || userData.password,
                picture: req.body.newPicture || ""
            }
        })

        res.sendStatus(200)
    } catch (error) {
        res.status(400).json("Failed to update user data, please try again.")
    }
}

module.exports = {
    changeUserData
}