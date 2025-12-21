import type { Response } from 'express'
import { prisma } from '../../lib/prisma.js'

async function parseInventoryStringToObjectList(inventoryString: string) {

    if (!inventoryString) return []

    let inventoryData: Array<{ itemId: string, amount: number }> = []

    inventoryString.split("#").forEach(itemString => {
        let [itemId, amount] = itemString.split("$")
        if (itemId && amount) {
            inventoryData.push({ itemId, amount: parseInt(amount) })
        }
    })


    try {
        let objectsList = await prisma.item.findMany({
            where: {
                id: {
                    in: inventoryData.map(item => item.itemId)
                }
            }
        })

        let inventory = inventoryData.map((itemData => {
            let ItemObject = objectsList.find(object => object.id == itemData.itemId)
            if (ItemObject) {
                let parsedItemData = JSON.parse(JSON.stringify(ItemObject.fullData))
                parsedItemData.id = ItemObject.id
                parsedItemData.amount = itemData.amount
                return parsedItemData
            }
        }))

        return (inventory)
    } catch (err) {
        throw err
    }
}

export async function getUserCharacters({ user, res }: { user: { id: string }, res: Response }) {
    try {
        const charactersList = await prisma.character.findMany({
            where: {
                ownerId: user.id
            }
        })

        let modedCharactersList = []

        for (let characterData of charactersList) {
            let inventory = await parseInventoryStringToObjectList(characterData.inventory)

            modedCharactersList.push({
                name: characterData.name,
                id: characterData.id,
                picture: characterData.picture,
                class: characterData.class,
                subClass: characterData.subClass,
                race: characterData.race,
                subRace: characterData.subRace,
                attributes: {
                    strength: characterData.strength,
                    dexterity: characterData.dexterity,
                    constitution: characterData.constitution,
                    intelligence: characterData.intelligence,
                    wisdom: characterData.wisdom,
                    charisma: characterData.charisma,
                },
                level: characterData.level,
                life: characterData.life,
                maxLife: characterData.maxLife,
                position: { x: -1, y: -1 },
                inventory: inventory
            })
        }

        res.status(200).json(modedCharactersList)

    } catch (error) {
        console.log(res)
        res.sendStatus(400)
    }
}

export async function getCharacterById({ characterId, user, res }: { characterId: string, user: { id: string }, res: Response }) {
    try {
        const characterData = await prisma.character.findUniqueOrThrow({
            where: {
                id: characterId,
            }
        })

        if (characterData.ownerId != user.id) {
            res.sendStatus(403)
            return
        }

        res.status(200).json(
            {
                name: characterData.name,
                id: characterData.id,
                picture: characterData.picture,
                class: characterData.class,
                subClass: characterData.subClass,
                race: characterData.race,
                subRace: characterData.subRace,
                attributes: {
                    strength: characterData.strength,
                    dexterity: characterData.dexterity,
                    constitution: characterData.constitution,
                    intelligence: characterData.intelligence,
                    wisdom: characterData.wisdom,
                    charisma: characterData.charisma,
                },
                level: characterData.level,
                life: characterData.life,
                maxLife: characterData.maxLife,
                position: { x: -1, y: -1 },
                inventory: await parseInventoryStringToObjectList(characterData.inventory)
            }
        )
    } catch (err) {
        console.log(err)
        res.sendStatus(404)
    }
}
