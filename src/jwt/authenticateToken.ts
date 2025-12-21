import type { NextFunction, Request, Response } from "express"
import jwt from 'jsonwebtoken'

export default function authenticateTokenMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null || !process.env.ACCESS_TOKEN_SECRET) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err: Error | null, user: any) => {
        if (err) {
            console.log(err)
            return res.sendStatus(403)
        }
        req.user = user
        next()
    })
}
