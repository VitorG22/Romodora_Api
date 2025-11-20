const { PrismaClient } = require('../generated/prisma/client');
const prisma = new PrismaClient()

async function SaveMap(req, res) {
    try {
        const mapData = req.body
        const userData = req.user

        await prisma.map.upsert({
            where: {
                id: mapData.id,
                ownerId: userData.userId
            },
            create: {
                name: mapData.name,
                description: mapData.description,
                lastModify: new Date(),
                layers: mapData.layers,
                sizeX: mapData.sizeX,
                sizeY: mapData.sizeY,
                ownerId: userData.userId
            },
            update: {
                name: mapData.name,
                description: mapData.description,
                lastModify: new Date(),
                layers: mapData.layers,
                sizeX: mapData.sizeX,
                sizeY: mapData.sizeY,
            }
        })

        res.sendStatus(200)
    } catch (error) {
        console.log(error)
        res.sendStatus(400)
    }
}

async function getAllUserMaps(req,res) {
    try {
        let userMaps = await prisma.map.findMany({
            where: {
                ownerId: req.user.userId
            }
        })
        res.status(200).json(userMaps)
    } catch (error) {
        console.log(error)
        res.sendStatus(400)
    }
}

async function deleteMapById(req,res){
    const userData = req.user
    try {
        await prisma.map.delete({
            where: {
                id:req.body.mapId,
                ownerId: userData.userId
            }
        })
        res.sendStatus(200)
    } catch (error) {
        console.log(error)
        res.sendStatus(400)
    }
}

async function getMapById(mapId, userId){
    try {
        let map = await prisma.map.findFirstOrThrow({
            where:{
                id: mapId,
                ownerId: userId
            }
        })
        return map
    } catch (error) {
        console.log(error)
        return null
    }
}

module.exports = {
    SaveMap,
    getAllUserMaps,
    deleteMapById,
    getMapById
}