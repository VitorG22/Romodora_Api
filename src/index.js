require("dotenv").config()
const express = require('express')
const http = require('node:http')
const cors = require('cors')
const { Login } = require('./userFunctions/login.js')
const { authenticateTokenMiddleware } = require("./jwt/autenticateToken.js")
const { sendRegisterCode, confirmRegisterCode } = require("./userFunctions/register.js")
const { getUserDataById } = require('./userFunctions/userData.js')
const { changeUserData } = require("./userFunctions/changeUserData.js")
const { startSocket } = require("./socket.js")
const { EditCharacter } = require("./characterFunctions/createCharacter.js")
const { getUserCharacters, getCharacterById } = require("./characterFunctions/getCharacter.js")
const { deleteCharacter } = require("./characterFunctions/deleteCharacter.js")

const app = express();
const server = http.createServer(app);


app.use(cors())
app.use(express.json({ limit: '50mb' }))


app.get('/', (req, res) => {
    res.json('Hello Word!')
})


app.post('/login', (req, res) => {
    console.log(req.body)
    Login(req.body, res)
})

app.post('/register', (req, res) => {
    sendRegisterCode(req.body, res)
})

app.post('/confirmRegisterCode', (req, res) => {
    confirmRegisterCode(req.body, res)
})

app.get('/getUserDataByToken', authenticateTokenMiddleware, (req, res) => {
    getUserDataById(req.user.userId, res)
})

app.post('/changeUserData', authenticateTokenMiddleware, (req, res) => {
    changeUserData(req, res)
})

app.post('/editCharacter', authenticateTokenMiddleware, (req,res)=>{
    EditCharacter(req,res)
})

app.get('/getUserCharacters', authenticateTokenMiddleware, (req,res)=>{
    getUserCharacters(req,res)
})

app.get('/getCharacterById/:characterId', authenticateTokenMiddleware, (req,res)=>{
    getCharacterById(req,res)
})

app.post('/deleteCharacter', authenticateTokenMiddleware, (req,res)=>{
    deleteCharacter(req,res)
})

const PORT = process.env.PORT
startSocket(server)
server.listen(PORT, () => {
    console.log(`Server is Running in Port: ${PORT}`)
})

module.exports = {
    server
}
