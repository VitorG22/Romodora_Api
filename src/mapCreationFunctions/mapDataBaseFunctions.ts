import type { Response } from 'express'
import { prisma } from '../../lib/prisma.js'

interface IMapData {
    id: string
    name: string
    description: string
    image?: string
    lastModify?: Date
    sizeX: number
    sizeY: number
    selectedLayer?: string
    layers: Array<{
        name: string,
        show: boolean,
        is: string,
        matrix: Array<{
            x: number
            y: number
            type: 'void' | 'floor' | "wall" | "entity"
            direction: 'top' | 'left' | 'bottom' | 'right'
            tileData: {
                name: string,
                path: string,
                size: { x: number, y: number }
                group: string
            } | null
            linkData: {
                isMainTile: boolean
                mainTilePosition: { x: number, y: number }
                groupPositions: { x: number, y: number }[]
            }
        }>[]
    }>
}
export async function SaveMap({ mapData, user, res }: { mapData: IMapData, user: { id: string }, res: Response }) {
    try {
        await prisma.map.upsert({
            where: {
                id: mapData.id,
                ownerId: user.id
            },
            create: {
                name: mapData.name,
                description: mapData.description,
                lastModify: new Date(),
                layers: mapData.layers,
                sizeX: mapData.sizeX,
                sizeY: mapData.sizeY,
                ownerId: user.id
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

export async function getAllUserMaps({user,res}:{user:{id:string}, res:Response}) {
    try {
        let userMaps = await prisma.map.findMany({
            where: {
                ownerId: user.id
            }
        })
        res.status(200).json(userMaps)
    } catch (error) {
        console.log(error)
        res.sendStatus(400)
    }
}

export async function deleteMapById({mapId,user,res}:{mapId:string,user:{id:string},res:Response}) {
    
    try {
        await prisma.map.delete({
            where: {
                id: mapId,
                ownerId: user.id
            }
        })
        res.sendStatus(200)
    } catch (error) {
        console.log(error)
        res.sendStatus(400)
    }
}

export async function getMapById(mapId:string,userId:string) {
    try {
        let map = await prisma.map.findFirstOrThrow({
            where: {
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
