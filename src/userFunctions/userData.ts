import jwt from 'jsonwebtoken'
import type { Response } from 'express'
import  {prisma} from '../../lib/prisma.js'

export async function getUserDataById({userId, res}:{userId:string, res:Response}) {
    console.log('get User data by id')
    console.log(userId)
    
    try {
        const userData = await prisma.user.findUniqueOrThrow({
            where: { id: userId },
            omit: { password: true }
        })
        res.status(200).json(userData)
    } catch (err) {
        console.log(err)
        res.status(400).json("User not found")
    }
}

export function getUserDataByToken(token:string) {

    if (token == null || !process.env.ACCESS_TOKEN_SECRET) return null

    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user:any) => {

        if (err || !user) {
            return null
        }

        try {
            const userData = await prisma.user.findUniqueOrThrow({
                where: {
                    id: user.id
                },
                omit: {
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
