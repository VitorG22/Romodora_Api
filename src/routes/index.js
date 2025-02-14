
const app = require('express')()
const cors = require('cors')
const bodyParser = require('body-parser')
const { GetStickers} = require('./function/assets')
const { Register, Login, GetResetPasswordCode, ConfirmPasswordCode, GetUserByToken, ChangeUserData, ResetPassword } = require('./function/user')
const { CreateJourney, GetJourneys, deleteJourneyByID } = require('./function/journey')
const { GetCharacters, CreateCharacter, UpdateCharacter ,DeleteCharacter } = require('./function/character')

app.use(cors({ origin: '*' }))
app.use(bodyParser.json())


app.get('/helloword', (req, res) => {
    return res.json('hello word')
})


// User Routes
app.post('/login', async (req, res) => {
    const result = await Login(req.body)
    return res.json(result)
})

app.post('/register', async (req, res) => {
    const result = await Register(req.body)
    return res.json(result)
})

app.post('/GetResetPasswordCode', async (req, res) => {
    const result = await GetResetPasswordCode(req.body)
    return res.json(result)
})

app.post('/ConfirmPasswordCode', async (req, res) => {
    const result = await ConfirmPasswordCode(req.body)
    return res.json(result)
})

app.post('/ResetPassword', async (req, res) => {
    const result = await ResetPassword(req.body)
    return res.json(result)
})


app.post('/getUserByToken', async (req, res)=>{
    const result = await GetUserByToken(req.body)
    return res.json(result)
})

app.post('/changeUserData', async(req,res)=>{
    const result = await ChangeUserData(req.body)
    return res.json(result)
})

// Config Journey Routes
app.post('/createJourney', async(req, res)=>{
    const result = await CreateJourney(req.body)
    return res.json(result)
})
app.post('/myJourney', async(req, res)=>{
    const result = await GetJourneys(req.body)
    return res.json(result)
})

// Config Character Routes
app.post('/character', async(req,res)=>{
    const result = await GetCharacters(req.body)
    return res.json(result)
})

app.post('/createCharacter', async(req,res)=>{
    const result = await CreateCharacter(req.body)
    return res.json(result)
})

app.post('/deleteCharacter', async(req,res)=>{
    const result = await DeleteCharacter(req.body)
    return res.json(result)
})

app.post('/updateCharacter', async(req,res)=>{
    const result = await UpdateCharacter(req.body)
    return res.json(result)
})

app.post('/deleteJourney', async(req,res)=>{
    // console.log(req.body)
    const result = await deleteJourneyByID(req.body)
    return res.json(result)
})

app.get('/getStickers', async(req,res)=>{
    return res.json(await GetStickers())
})

module.exports.app = app 