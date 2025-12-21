type TUser = {
        id: string
        randomKey: string
        iat: number
        exp: number
}

declare namespace Express{
    interface Request{
        user?: TUser
    }
}