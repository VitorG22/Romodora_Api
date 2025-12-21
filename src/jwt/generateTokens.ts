import 'dotenv/config'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

export default function generateAccessToken(id:string) {
    const secret = process.env.ACCESS_TOKEN_SECRET
    const randomKey =  crypto.randomBytes(64).toString('hex')

    
    const accessToken = jwt.sign({id,randomKey}, secret!, {expiresIn: "1day"})
    return(accessToken)
}
