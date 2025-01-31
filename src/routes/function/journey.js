const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function CreateJourney({ banner, name, token }) {

    try {
        const ownerId = await prisma.user.findUniqueOrThrow({
            select: {
                id: true
            },
            where: {
                token: token
            }
        })
        const res = await prisma.journey.create({
            select: {
                id: true
            },
            data: {
                banner: banner,
                name: name,
                owner: ownerId.id
            }
        })
        return ({
            status: 'success',
            result: res
        })
    } catch (err) {
        console.log(err)
        return ({
            status: 'fail',
            message: 'Error when creating journey'
        })
    }
}

async function GetJourneys({ token }) {

    try {
        const res = await prisma.journey.findMany({
            select: {
                banner: true,
                id: true,
                name: true,
            },
            where: {
                journey_owner: {
                    token: token
                }
            }
        })
        return ({
            status: 'success',
            result: res
        })
    } catch (err) {
        return ({
            status: 'fail',
            result: 'Nenhuma jornada encontrada'
        })
    }
}

async function GetJourneysById(journeyId) {
    try {
        const res = await prisma.journey.findUniqueOrThrow({
            where: {
                id: journeyId
            }
        })
        return ({
            status: 'success',
            result: res
        })

    } catch (err) {
        return ({
            status: 'fail',
            message: 'Journey Not Found'
        })
    }
}

async function deleteJourneyByID({ journey_id, token }) {
    try {
        const deleteResult =  await prisma.journey.delete({
            where: {
                id: journey_id,
                journey_owner: {
                    token: token
                }
            }
        })
        console.log('teste')

        return await GetJourneys({token})
    } catch (error) {
        console.log(error)
        return ({
            status: 'fail',
            message: 'Journey cant be deleted'
        })
    }
}

module.exports = {
    CreateJourney, GetJourneys, deleteJourneyByID
}