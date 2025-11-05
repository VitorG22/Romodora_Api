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
const { getAssetsList } = require("./mapCreationFunctions/getAssetsList.js")
const { SaveMap, getAllUserMaps, deleteMapById } = require("./mapCreationFunctions/mapDataBaseFunctions.js")

const app = express();
const server = http.createServer(app);


app.use(cors())
app.use(express.json({ limit: '50mb' }))


app.get('/', (req, res) => {
    res.json('Hello Word!')
})


app.post('/login', (req, res) => {
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

app.post('/editCharacter', authenticateTokenMiddleware, (req, res) => {
    EditCharacter(req, res)
})

app.get('/getUserCharacters', authenticateTokenMiddleware, (req, res) => {
    getUserCharacters(req, res)
})

app.get('/getCharacterById/:characterId', authenticateTokenMiddleware, (req, res) => {
    getCharacterById(req, res)
})

app.post('/deleteCharacter', authenticateTokenMiddleware, (req, res) => {
    deleteCharacter(req, res)
})

app.get('/mapAssets', authenticateTokenMiddleware, (req, res) => {
    getAssetsList(res)
})
app.get('/allMaps', authenticateTokenMiddleware, (req, res) => {
    getAllUserMaps(req,res)
})

app.post('/saveMap', authenticateTokenMiddleware, (req, res)=>{
    SaveMap(req,res)
})
app.post('/deleteMap', authenticateTokenMiddleware, (req, res)=>{
    deleteMapById(req,res)
})

app.get('/proxy', async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).send("URL missing");

    const response = await fetch(url);
    const blob = await response.arrayBuffer();

    res.set("Access-Control-Allow-Origin", "*");
    res.set("Content-Type", response.headers.get("content-type"));
    res.send(Buffer.from(blob));

})

const PORT = process.env.PORT
startSocket(server)
server.listen(PORT, () => {
    console.log(`Server is Running in Port: ${PORT}`)
})

module.exports = {
    server
}
