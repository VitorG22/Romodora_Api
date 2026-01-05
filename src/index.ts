import "dotenv/config";
const express =  require('express')
const http = require('node:http')
const cors = require('cors')
import type { Request, Response } from 'express'
import Login from "./userFunctions/login";
import { confirmRegisterCode, sendRegisterCode } from "./userFunctions/register";
import { getUserDataById } from "./userFunctions/userData";
import authenticateTokenMiddleware from "./jwt/authenticateToken";
import { changeUserData } from "./userFunctions/changeUserData";
import { getCharacterById, getUserCharacters } from "./characterFunctions/getCharacter";
import deleteCharacter from "./characterFunctions/deleteCharacter";
import EditCharacter from "./characterFunctions/createCharacter";
import { deleteMapById, getAllUserMaps, SaveMap } from "./mapCreationFunctions/mapDataBaseFunctions";
import getAssetsList from "./mapCreationFunctions/getAssetsList";
import { startSocket } from "./socket/server";
import type { Server as httpServer } from "http";
import editItem from "./itemsFunctions/createItem";
import { getAllUserItems, getItemById } from "./itemsFunctions/getItem";

const app = express()
const server:httpServer = http.createServer(app)

export interface IExpressRequest{
    req: Request,
    user?: {
        name: string,
        email: string,
        token:string
        id:string
    }
}


app.use(cors())
app.use(express.json({ limit: '50mb' }))


app.get('/', (req:Request, res:Response) => {
    req = req
    res.json('Hello Word!')
})

// ---------- USER ---------- //

app.post('/login', (req:Request, res:Response) => {
    console.log(req)
    Login({data:req.body, res:res})
})

app.post('/register', (req:Request, res:Response) => {
    sendRegisterCode({data:req.body, res:res})
})

app.post('/confirmRegisterCode', (req:Request, res:Response) => {
    confirmRegisterCode({data:req.body, res:res})
})

app.get('/getUserDataByToken', authenticateTokenMiddleware ,(req:Request,res:Response) => {
    getUserDataById({userId:req.user!.id, res:res})
})

app.post('/changeUserData', authenticateTokenMiddleware, (req:Request, res:Response) => {
    changeUserData({
        data:req.body,
        user: req.user!,
        res:res
    })
})

// ---------- CHARACTERS ---------- //

app.post('/editCharacter', authenticateTokenMiddleware, (req:Request, res:Response) => {
    EditCharacter({
        characterData:req.body,
        res:res,
        user:req.user!
    })
})

app.get('/getUserCharacters', authenticateTokenMiddleware, (req:Request, res:Response) => {
    getUserCharacters({
        user:req.user!,
        res:res
    })
})

app.get('/getCharacterById/:characterId', authenticateTokenMiddleware, (req:Request, res:Response) => {
    if(!req.params.characterId){
        res.sendStatus(400)
        return
    }
    getCharacterById({
        characterId: req.params.characterId,
        user:req.user!,
        res:res
        
    })
})

app.post('/deleteCharacter', authenticateTokenMiddleware, (req:Request, res:Response) => {
    deleteCharacter({
        characterId: req.body.characterId,
        user:req.user!,
        res:res
    })
})

// ---------- MAPS ---------- //

app.get('/mapAssets', authenticateTokenMiddleware, (req:Request, res:Response) => {
    getAssetsList({res:res})
})

app.get('/allMaps', authenticateTokenMiddleware, (req:Request, res:Response) => {
    getAllUserMaps({
        res:res,
        user:req.user!
    })
})

app.post('/saveMap', authenticateTokenMiddleware, (req:Request, res:Response)=>{
    SaveMap({
        mapData: req.body,
        res:res,
        user:req.user!
    })
})

app.post('/deleteMap', authenticateTokenMiddleware, (req:Request, res:Response)=>{
    deleteMapById({
        mapId:req.body.mapId,
        res:res,
        user:req.user!
    })
})

// ---------- ITEMS ---------- //

app.get('/getItems', authenticateTokenMiddleware, (req:Request,res:Response)=>{
    getAllUserItems({
        res:res,
        user:req.user!
    })
})

app.get('/getItemById/:itemId', authenticateTokenMiddleware, (req:Request,res:Response)=>{
    console.log("Active Get Item By Id")
    if(!req.params.itemId){
        res.sendStatus(401)
        return
    }

    getItemById({
        itemId: req.params.itemId,
        res: res
    })
})

app.post('/saveItem',authenticateTokenMiddleware, (req:Request,res:Response)=>{
    editItem({
        itemData:req.body, 
        user:req.user!,
        res:res
    })
})



app.get('/proxy', async (req:Request, res:Response) => {
    const url = req.query.url?.toString()
    if (!url) return res.status(400).send("URL missing");

    
    const response = await fetch(url);
    const blob = await response.arrayBuffer();

    res.set("Access-Control-Allow-Origin", "*");
    res.set("Content-Type", response.headers.get("content-type")|| '');
    res.send(Buffer.from(blob));

})

const PORT = process.env.PORT
startSocket(server)
server.listen(PORT, () => {
    console.log(`Server is Running in Port: ${PORT}`)
})




