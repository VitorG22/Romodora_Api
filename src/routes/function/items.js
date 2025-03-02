const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function ConvertItem(itemData){
    
    const newItemData = {
        id: itemData.id,
        name: itemData.name,
        description:itemData.description,
        type: itemData.type,
        usageCount: itemData.usageCount,
        image: itemData.image,
        launch: {
            isLaunchable: itemData.isLaunchable,
            range: itemData.launcheRange
        },
        damage: {
            diceType: itemData.damageDiceType,
            diceAmount: itemData.damageDiceAmount,
            damageType: itemData.damageType,
            effectArea: itemData.damageEffectArea
        },
        heal: {
            diceType: itemData.healDiceType,
            diceAmount: itemData.healDiceAmount,
            effectArea: itemData.healEffectArea
        }
    }
    return newItemData
}

async function GetItems({ userId }) {
    
    try {
        let itemsList = await  prisma.item.findMany({
            where:{
                OR: [
                    {owner: userId},
                    {owner: '0'}
                ]
                
            }
        })

        itemsList = itemsList.map(itemData=> ConvertItem(itemData))
        return {
            status: 'success',
            result: itemsList
        }
    } catch (error) {
        
        return {
            status: 'fail',
            message: 'Items not found' 
        }
    }
}

async function GetItemById(itemId) {


    try {
        const itemData = await prisma.item.findUnique({
            where: {
                id: itemId
            }
        })
        const newItemData = ConvertItem(itemData)

        return {
            status: 'success',
            result: newItemData
        }
    } catch (error) {
        return {
            status: 'fail',
            message: 'item not found!' 
        }
    }

}

// function CreateItem(ItemData) {
//     try {
//         const res = prisma
//     } catch (error) {

//     }

// }




module.exports = {
    GetItems,
    GetItemById
}