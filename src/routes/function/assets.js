async function GetStickers(){
    const stickersList = [
        'https://raw.githubusercontent.com/VitorG22/Romodora_Api/refs/heads/main/assets/stickers/Rub.png'
    ]
    return ({
        status: 'success',
        result: stickersList
    })
}

module.exports = {
    GetStickers
}