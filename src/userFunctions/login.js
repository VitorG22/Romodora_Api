const {generateAccessToken} = require('../jwt/generateTokens.js')
const { PrismaClient } = require('../generated/prisma/client.js')

const { hashPassword } = require('../scripts/hashPassword.js')
const prisma = new PrismaClient()

async function Login({ email, password }, res) {
    email = email.toLowerCase()
    
    try {
        const emailOwnerData = await prisma.user.findUnique({
            where:{email: email},
            select:{
                password:true,
                id:true,
            }
        })

        if(emailOwnerData == null){
            res.status(400).json("No user registered with this email")
            throw new Error
        }

        if(emailOwnerData.password != hashPassword(password)){
            res.status(400).json("Incorrect password")
            throw new Error
        }
        
        const accessToken = generateAccessToken(emailOwnerData.id)
        res.status(200).json(accessToken)
        
    } catch (error) {
        console.log(error)
    }
    
}

module.exports = {
    Login
}
