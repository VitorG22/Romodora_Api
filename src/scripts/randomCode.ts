export default function generateRandomCode(codeLength:number):string {
    const characters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
    let randomString = ''

    for (let i:number = 0; i < codeLength; i++) {
        var randomCharacter = characters[Math.floor(Math.random() * characters.length)]
        randomString += randomCharacter
    }

    return randomString
}
