import type { Response } from 'express'
import {prisma} from '../../lib/prisma.js'

export default async function deleteCharacter({characterId,user, res}:{characterId:string, user:{id:string},res:Response}) {
    try {
        await prisma.character.delete({
            where: {
                id: characterId,
                ownerId: user.id
            }
        })
        res.sendStatus(200)
    } catch (error) {
        console.log(error)
        res.sendStatus(403)
    }
}