const { createHash } = require('crypto')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const nodemailer = require('nodemailer')
require('dotenv').config()

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

async function GetResetPasswordCode({ email }) {
    function GenerateRandomCode(codeLength) {
        const characters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
        let randomString = ''

        for (i = 0; i < codeLength; i++) {
            var randomCharacter = characters[Math.floor(Math.random() * characters.length)]
            randomString += randomCharacter
        }

        return randomString
    }

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAILPASSWORD
        }
    })

    try {
        let emailOwnerData = await prisma.user.findUniqueOrThrow({
            where: { email: email },
            select: { id: true }
        })

        if (emailOwnerData.id.length <= 0) throw new Error
        let code = GenerateRandomCode(6)

        let updateResult = await prisma.user.update({
            where: { id: emailOwnerData.id },
            data: { passwordResetCode: code },
            select:{id: true}
        })


        var mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Reset Password',
            html: `
<body style="background-color: #101010;font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table style="background-color: #101010;font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <tr>
            <center>
                <h1>Your reset password code is</h1>
            </center>
        </tr>
        <tr>
            <center>
                <h2
                    style="width: fit-content;background-color: #e0e0e0;padding: 1rem 2rem;letter-spacing: 15px;font-size: xx-large;border-radius: 5px;">
                    ${code}</h2>
            </center>
        </tr>
        <tr>
            <center>
                <p style="font-size: large;text-align:center;width: 80%; ">If you have not requested to change your
                    password, just ignore this message</p>
            </center>
        </tr>
        <tr>
            <center>
                <h6>By Romodora</h6>
            </center>
        </tr>
        </article>
    </table>
</body>
                `
            }


        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                throw error
            } else {
                console.log('Email sent: ' + info.response);
            }
        })

        return ({ status: 'success' })

    } catch (error) {
        console.log(error)
        return ({
            status: 'fail',
            message: "Email not Found"
        })
    }
}

async function ConfirmPasswordCode({ email, code }) {
    try {
        let emailOwnerData = await prisma.user.findUniqueOrThrow({
            where: {
                email: email,
                passwordResetCode: code
            },
            select: { id: true }
        })
        if (!emailOwnerData) throw new Error

        return {
            status: 'success'
        }
    } catch (error) {
        return {
            status: 'fail',
            message: 'Invalid Code'
        }
    }
}

async function ResetPassword({ email, code, newPassword }) {
    try {
        let result = await prisma.user.update({
            where: {
                email: email,
                passwordResetCode: code
            },
            data: {
                password: hashPassword(newPassword),
                passwordResetCode: null
            }
        })

        return {
            status: 'success'
        }
    } catch (error) {

        return {
            status: 'fail',
            message: 'Invalid Code'
        }
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

module.exports = { Login, Register, GetUserByToken, ChangeUserData, GetResetPasswordCode, ConfirmPasswordCode, ResetPassword }