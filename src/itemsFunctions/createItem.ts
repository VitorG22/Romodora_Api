import type { Response } from "express"

import {prisma} from '../../lib/prisma'

export default async function editItem({itemData,user,res}:{itemData:any,user:{id:string}, res:Response}) {
    
    let itemCopy =  structuredClone(itemData)
    delete itemCopy.id
    try {

        await prisma.item.upsert({
            where:{
                    id:itemData.id || "",
                    ownerId: user.id
            },
            update: {
                type: itemData.type,
                name: itemData.name,
                ownerId: user.id,
                fullData: itemCopy
            },
            create:{
                type: itemData.type,
                name: itemData.name,
                ownerId: user.id,
                fullData: itemCopy
            }
        })
        res.sendStatus(200)
    } catch (error) {
        console.log(error)
        res.sendStatus(401)
    }
}