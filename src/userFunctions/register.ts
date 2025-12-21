import type { Response } from "express"
import nodemailer from "nodemailer"
import { prisma } from '../../lib/prisma'
import hashPassword from '../scripts/hashPassword'
import generateAccessToken from '../jwt/generateTokens'
import generateRandomCode from '../scripts/randomCode'

export async function sendRegisterCode({ data, res }: { data: { email: string, password: string, name: string }, res: Response }) {
    data.email = data.email.toLowerCase()
    let { email, password, name } = data

    try {
        const thisUserAlreadyExist = await prisma.user.findFirst({
            where: { email: email },
            select: { id: true }
        })
        if (thisUserAlreadyExist != null) throw new Error

        const accessCode = generateRandomCode(4)

        await prisma.registerCode.upsert({
            where: { email: email },
            create: {
                email: email,
                name: name,
                code: accessCode,
                password: hashPassword(password)
            },
            update: {
                email: email,
                name: name,
                code: accessCode,
                password: hashPassword(password)
            }
        })
        SendRegisterCodeEmail({ data: { email: email, code: accessCode } })
        res.sendStatus(200)
    } catch (error) {
        res.status(400).json('email already registered')
    }



}

export async function confirmRegisterCode({ data, res }: { data: { email: string, code: string }, res: Response }) {
    data.email = data.email.toLowerCase()
    let { email, code } = data

    try {
        const codeOwnerData = await prisma.registerCode.findUniqueOrThrow({
            where: {
                email: email,
                code: code.toUpperCase()
            }
        })
        const userData = await prisma.user.create({
            data: {
                email: codeOwnerData.email,
                name: codeOwnerData.name,
                password: codeOwnerData.password
            }
        })

        await prisma.registerCode.delete({
            where: { id: codeOwnerData.id }
        })

        const accessToken = generateAccessToken(userData.id)
        res.status(200).json(accessToken)
    } catch (error) {
        console.log(error)
        res.status(400).json('Invalid Code')
    }
}


async function SendRegisterCodeEmail({ data }: { data: { email: string, code: string } }) {

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAILPASSWORD
        }
    })


    var mailOptions = {
        from: process.env.EMAIL,
        to: data.email,
        subject: 'Confirm Code',
        html: `
<body style="background-color: #101010;font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table style="background-color: #101010;font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <tr>
            <center>
                <p style="font-size: large;text-align:center;width: 80%; ">Welcome to Romodora</p>
            </center>
        </tr>
        <tr>
            <center>
                <h1>Your code is</h1>
            </center>
        </tr>
        <tr>
            <center>
                <h2
                    style="width: fit-content;background-color: #e0e0e0;padding: 1rem 2rem;letter-spacing: 15px;font-size: xx-large;border-radius: 5px;">
                    ${data.code}</h2>
            </center>
        </tr>
        <tr>
            <center>
                <p style="font-size: large;text-align:center;width: 80%; ">If you do not recognize this email, please ignore it.</p>
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

    transporter.sendMail(mailOptions, function (error: Error | null ) {
        if (error) {
            console.log(error)
            throw error
        }

    })

    return
}
