const nodemailer = require('nodemailer')
const { PrismaClient } = require('../generated/prisma/client')
const prisma = new PrismaClient()
const {hashPassword} = require('../scripts/hashPassword')
const { generateAccessToken } = require('../jwt/generateTokens')
const { GenerateRandomCode } = require('../scripts/randomCode')

async function sendRegisterCode({email,password,name},res){
    email = email.toLowerCase()
    
    try {
        const thisUserAlreadyExist = await prisma.user.findFirst({
            where:{email: email},
            select:{id:true}
        })
        if(thisUserAlreadyExist != null) throw new Error
        
        const accessCode = GenerateRandomCode(4) 

        await prisma.registerCode.upsert({
            where:{email: email},
            create: {
                email: email,
                name:name,
                code:accessCode,
                password: hashPassword(password)
            },
            update:{
                email: email,
                name:name,
                code:accessCode,
                password: hashPassword(password)
            }
        })
        SendRegisterCodeEmail(email, accessCode)
        res.sendStatus(200)
    } catch (error) {
        res.status(400).json('email already registered')
    }



}

async function confirmRegisterCode({ email, code }, res) {
    email = email.toLowerCase()
    try {
        const codeOwnerData = await prisma.registerCode.findUniqueOrThrow({
            where:{
                email:email,
                code:code.toUpperCase()
            }
        })
        const userData = await prisma.user.create({
            data:{
                email:codeOwnerData.email,
                name:codeOwnerData.name,
                password: codeOwnerData.password 
            }
        })
        
        await prisma.registerCode.delete({
            where:{id: codeOwnerData.id}
        })
        
        const accessToken = generateAccessToken(userData.id)
        res.status(200).json(accessToken)
    } catch (error) {
        console.log(error)
        res.status(400).json('Invalid Code')
    }
}


async function SendRegisterCodeEmail(email,code) {

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAILPASSWORD
        }
    })


    var mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Confirm Code',
        html: `
<body style="background-color: #101010;font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table style="background-color: #101010;font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <tr>
            <center>
                <h1>Your code is</h1>
            </center>
        </tr>
        <tr>
            <center>
                <h2
                    style="width: fit-content;background-color: #e0e0e0;padding: 1rem 2rem;letter-spacing: 15px;font-size: xx-large;border-radius: 5px;">
                    ${code}</h2>
            </center>
        </tr>
        <tr>
            <center>
                <p style="font-size: large;text-align:center;width: 80%; ">If you do not recognize this email, please ignore it.</p>
            </center>
        </tr>
        <tr>
            <center>
                <h6>By Romodora</h6>
            </center>
        </tr>
        </article>
    </table>
</body>
                `
    }


    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error)
            throw error
        }
    })
    return
}



module.exports = {
    sendRegisterCode,
    confirmRegisterCode
}