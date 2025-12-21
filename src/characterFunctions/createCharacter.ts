import type { Response } from 'express'
import { prisma } from '../../lib/prisma.js'

interface ICharacter {
    name: string
    id: string
    picture: string
    class: string
    subClass: string
    race: string
    subRace: string
    attributes: {
        strength: number
        dexterity: number
        constitution: number
        intelligence: number
        wisdom: number
        charisma: number
    }
    level: number
    life: number
    maxLife: number
    ownerId: string
    inventory: Array<{id:string, amount:string}>
}

export default async function EditCharacter({ characterData, user, res }: { characterData: ICharacter, user: { id: string }, res: Response }) {


    console.log(characterData.inventory)
    let inventoryString:string = ''
    characterData.inventory.forEach(itemData => {inventoryString += `${itemData.id}$${itemData.amount}#`})
    console.log(inventoryString)

    
    try {
        await prisma.character.upsert({
            where: { id: characterData.id },
            create: {
                class: characterData.class,
                level: characterData.level,
                life: characterData.life,
                maxLife: characterData.maxLife,
                name: characterData.name,
                picture: characterData.picture,
                race: characterData.race,
                subClass: characterData.subClass,
                subRace: characterData.subRace,
                charisma: characterData.attributes.charisma,
                constitution: characterData.attributes.constitution,
                dexterity: characterData.attributes.dexterity,
                intelligence: characterData.attributes.intelligence,
                strength: characterData.attributes.strength,
                wisdom: characterData.attributes.wisdom,
                ownerId: user.id,
                inventory:inventoryString
            },
            update: {
                class: characterData.class,
                level: characterData.level,
                life: characterData.life,
                maxLife: characterData.maxLife,
                name: characterData.name,
                picture: characterData.picture,
                race: characterData.race,
                subClass: characterData.subClass,
                subRace: characterData.subRace,
                charisma: characterData.attributes.charisma,
                constitution: characterData.attributes.constitution,
                dexterity: characterData.attributes.dexterity,
                intelligence: characterData.attributes.intelligence,
                strength: characterData.attributes.strength,
                wisdom: characterData.attributes.wisdom,
                inventory:inventoryString
            }
        })


        res.sendStatus(200)
    } catch (err) {
        console.log(err)
        res.sendStatus(400)
    }

}
