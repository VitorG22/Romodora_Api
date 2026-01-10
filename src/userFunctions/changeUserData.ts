import type { Response } from "express";
import { prisma } from '../../lib/prisma'
import hashPassword from '../scripts/hashPassword'


export async function changeUserData({ data, user, res }: {
    data: {
        password?: string,
        newPassword?: string
        newUserName?: string
        newPicture?: string
    }, user: { id: string }, res: Response
}) {

    try {
        const userData = await prisma.user.findUniqueOrThrow({ where: { id: user.id } })

        let newPassword = undefined
        if (data.newPassword) { newPassword = hashPassword(data.newPassword) }

        if (newPassword != undefined && (data.password == undefined || userData.password != hashPassword(data.password))) {
            res.status(400).json('incorrect Password')
            return
        }



        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                name: data.newUserName || userData.name,
                password: newPassword || userData.password,
                picture: data.newPicture || ""
            }
        })

        res.sendStatus(200)
    } catch (error) {
        res.status(400).json("Failed to update user data, please try again.")
    }
}
