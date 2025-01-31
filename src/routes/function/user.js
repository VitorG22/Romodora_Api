const { createHash } = require('crypto')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function hashPassword(password) {
    const hashedPassword = createHash('sha256').update(password).digest('hex')
    return hashedPassword
}
async function GenerateToken(TokenCharacterCount) {
    const characters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', '-', '_', '@', '#', '$', '!', '%', '&']
    let accessToken = ''

    for (i = 0; i < TokenCharacterCount; i++) {
        var randomCharacter = characters[Math.floor(Math.random() * characters.length)]
        accessToken += randomCharacter
    }


    const response = await prisma.user.findUnique({
        where: {
            token: accessToken
        }
    })

    if (response) {
        return GenerateToken(TokenCharacterCount)
    } else {
        return accessToken
    }
}

async function Login({ email, password }) {
    let expireDate = new Date()
    expireDate.setDate(expireDate.getDate() + 1);
    expireDate
    try {
        const result = await prisma.user.update({
            select: {
                token: true,
                token_expire: true
            },
            data: {
                token: await GenerateToken(255),
                token_expire: expireDate
            },
            where: {
                email: email,
                password: hashPassword(password)
            }
        })
        return ({
            status: 'success',
            result: result
        })

    } catch (err) {
        console.log(err)
        return ({
            status: 'fail',
            result: {
                'message': 'User not found'
            }
        })
    }

}

async function Register({ name, email, password }) {
    try {
        const result = await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashPassword(password)
            }
        })

        return await Login({ email: email, password: password })

    } catch (err) {
        if (err?.meta?.target == 'email') {
            return ({
                status: 'fail',
                message: 'Email already registered'

            })
        }
        return ({
            status: 'fail',
            message: 'An error occurred'
        })
    }
}

async function ChangeUserData({ name, picture, token }) {
    try {
        let newPlayerData = await prisma.user.update({
            select: {
                name: true,
                email: true,
                picture: true,
                id: true
            },
            where: {
                token: token
            },
            data: {
                name: name,
                picture: picture
            }
        })
        return ({
            status: 'success',
            result: newPlayerData
        })

    } catch (error) {
        return ({
            status: 'fail',
            message: 'Invalid Access Token'
        })
    }
}

async function GetUserByToken({ token }) {

    try {
        const result = await prisma.user.findUniqueOrThrow({
            select: {
                email: true,
                name: true,
                id: true,
                picture: true,

            },
            where: {
                token: token
            }
        })
        return ({
            status: 'success',
            result: result
        })

    } catch (err) {
        console.log(err)
        return ({
            status: 'fail',
            message: 'User not found'
        })
    }
}

module.exports = { Login, Register, GetUserByToken, ChangeUserData }