const fs = require('fs')

function getAssetsList(res) {

    try {
        fs.readFile('src/mapCreationFunctions/tiles.json', (err, arq) => {
            if(err){throw new Error(err)}
            let data = JSON.parse(arq)
            res.status(200).json(data)
        })

    } catch (error) {
        console.log(error)
        res.sendStatus(400)
    }
}


module.exports = {
    getAssetsList
}