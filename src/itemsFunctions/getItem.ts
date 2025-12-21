import type { Response } from "express";
import { prisma } from "../../lib/prisma";

export async function getAllUserItems({ user, res }: { user: { id: string }, res: Response }) {
    try {
        const itemsList = await prisma.item.findMany({
            where: {
                ownerId: user.id
            },
            select: {
                id: true,
                fullData: true
            }
        })

        let parsedItemList = []
        for (let itemData of itemsList) {
            let parsedItem = {
                ...JSON.parse(JSON.stringify(itemData.fullData)),
                id: itemData.id
            }
            
            parsedItemList.push(parsedItem)
        }

        res.status(200).json(parsedItemList)
    } catch (error) {
        console.log(error)
        res.sendStatus(404)
    }
}

export async function getItemById({ itemId, res }: { itemId: string, res: Response }) {
    try {
        const itemData = await prisma.item.findUniqueOrThrow({
            where: {
                id: itemId
            },
            select: {
                fullData: true
            }
        })

        let parsedItemData = JSON.parse(JSON.stringify(itemData.fullData))
        parsedItemData.id = itemId
        // console.log(parsedItemData)
        res.status(200).json(parsedItemData)
    } catch (error) {
        console.log(error)
        res.sendStatus(404)
    }
}