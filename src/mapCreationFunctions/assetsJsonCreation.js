const fs = require('fs')
const {imageSizeFromFile} = require('image-size/fromFile')

const assetsDir = '../../assets/tiles'

async function AssetsJson() {
    let assetsObject = {}

    fs.readdir(assetsDir, async(err, arq) => {
        if (err) return
        for (i = 0; i < arq.length; i++) {
            let folderName = arq[i]
            assetsObject[folderName] = []
            await new Promise(resolve => {
                fs.readdir(`${assetsDir}/${folderName}`, (error, tilesList) => {
                    if (error) return
                    tilesList.forEach(async(tileName, tileIndex) => {
                        assetsObject[folderName].push({
                            path: `https://github.com/VitorG22/Romodora_Api/blob/main/assets/tiles/${folderName}/${tileName}?raw=true`,
                            name: getImageName(tileName),
                            size: await getImageSize(folderName,tileName),
                            group: folderName.replace('_', ' ')
                        })
                        if(tileIndex == tilesList.length - 1){resolve()}
                    })
                })
            })
        }
        fs.writeFileSync("./tiles.json", JSON.stringify(assetsObject))

    })

}

function getImageName(tileName) {
    let tileNameCopy = tileName.replace('.png', '')
    let tileNameSplit = tileNameCopy.split('_')
    tileNameCopy = tileNameSplit.join(' ').trim()
    console.log(tileNameCopy)
    
    return tileNameCopy

}

async function getImageSize(folderName,fileName){
    const dimensions = await imageSizeFromFile(`../../assets/tiles/${folderName}/${fileName}`)
    let size = {x:dimensions.width/200 ,y:dimensions.height/200}
    return(size)
}


AssetsJson()
