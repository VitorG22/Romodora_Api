import {createHash} from 'crypto'

export default function hashPassword(password:string):string {
    const hashedPassword = createHash('sha256').update(password).digest('hex')
    return hashedPassword
}