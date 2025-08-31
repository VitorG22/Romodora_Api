const { PrismaClient } = require("../generated/prisma/client")
const prisma = new PrismaClient()
const jwt = require('jsonwebtoken')

async function getUserDataById(userId, res) {
    try {
        const userData = await prisma.user.findUniqueOrThrow({
            where: { id: userId },
            omit: { password: true }
        })
        res.status(200).json(userData)
    }catch(err){
        console.log(err)
        res.status(400).json("User not found")
    }
}

function getUserDataByToken(token) {

    if (token == null) return null

    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async(err, user) => {
        
        if (err) {
            return null
        }

        try {
            const userData = await prisma.user.findUniqueOrThrow({
                where: {
                    id: user.userId
                },
                omit:{
                    password: true
                }
            })
            return userData
        } catch (error) {
            console.log(error)
            return null
        }
    })
}

module.exports = {
    getUserDataById,
    getUserDataByToken
}