import generateAccessToken from '../jwt/generateTokens'
import hashPassword from '../scripts/hashPassword' 
import {prisma} from '../../lib/prisma.js'
import type { Response } from 'express'

export default async function Login({data , res}:{data:{ email:string, password:string }, res:Response}) {
    data.email = data.email.toLowerCase()
    let {email, password} = data
    
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
