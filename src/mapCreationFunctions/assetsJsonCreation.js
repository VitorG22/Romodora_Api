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
                        console.log(folderName)
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

function getImageName(fileName) {
    const numberList = '0123456789'
    let fileNameCopy = fileName.replace('.png', '')

    let tileVariation = ''
    if (numberList.includes(fileNameCopy[fileNameCopy.length - 1]) == false) {
        tileVariation = fileNameCopy[fileNameCopy.length - 1]
        fileNameCopy = fileNameCopy.slice(0, -2)
    }

    let fileNameSplit = fileNameCopy.split("_")
    fileNameSplit.pop()
    fileNameSplit.push(tileVariation)
    fileNameCopy = fileNameSplit.join(' ').trim()
    return fileNameCopy
}

// function getImageSize(fileName) {
//     const numberList = '0123456789'
//     let fileNameCopy = fileName.replace('.png', '')


//     if (numberList.includes(fileNameCopy[fileNameCopy.length - 1]) == false) {
//         fileNameCopy = fileNameCopy.slice(0, -2)
//     }

//     let fileNameSplit = fileNameCopy.split("_")


//     let sizeSplit = fileNameSplit[fileNameSplit.length - 1].split('x')
//     let size = { x: parseInt(sizeSplit[0]), y: parseInt(sizeSplit[1]) }
//     return size
// }

async function getImageSize(folderName,fileName){
    const dimensions = await imageSizeFromFile(`../../assets/tiles/${folderName}/${fileName}`)
    let size = {x:dimensions.width/200 ,y:dimensions.height/200}
    return(size)
}


AssetsJson()
