require("dotenv").config()
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

function generateAccessToken(userId) {
    const secret = process.env.ACCESS_TOKEN_SECRET
    const randomKey =  crypto.randomBytes(64).toString('hex')

    const accessToken = jwt.sign({userId,randomKey}, secret, {expiresIn: "1day"})
    return(accessToken)
}


module.exports = {
    generateAccessToken,
}