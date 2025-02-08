async function GetStickers(){
    const stickersList = [
        'https://raw.githubusercontent.com/VitorG22/Romodora_Api/refs/heads/main/assets/stickers/Rub_1.png',
        'https://raw.githubusercontent.com/VitorG22/Romodora_Api/refs/heads/main/assets/stickers/Rub_2.png',
        'https://raw.githubusercontent.com/VitorG22/Romodora_Api/refs/heads/main/assets/stickers/Rub_3.png',
        'https://raw.githubusercontent.com/VitorG22/Romodora_Api/refs/heads/main/assets/stickers/Rub_4.png',
        'https://raw.githubusercontent.com/VitorG22/Romodora_Api/refs/heads/main/assets/stickers/Rub_5.png',
        'https://raw.githubusercontent.com/VitorG22/Romodora_Api/refs/heads/main/assets/stickers/Rub_6.png',
        'https://raw.githubusercontent.com/VitorG22/Romodora_Api/refs/heads/main/assets/stickers/Rub_7.png',
    ]
    return ({
        status: 'success',
        result: stickersList
    })
}

module.exports = {
    GetStickers
}