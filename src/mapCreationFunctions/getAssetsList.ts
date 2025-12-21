import type { Response } from "express"

const fs = require('fs')

export default function getAssetsList({res}:{res:Response}) {

    try {
        fs.readFile('src/mapCreationFunctions/tiles.json', (err:string, arq:string) => {
            if(err){throw new Error(err)}
            let data = JSON.parse(arq)
            res.status(200).json(data)
        })

    } catch (error) {
        console.log(error)
        res.sendStatus(400)
    }
}