import express from "express"
import { asyncRoute } from "./common.js"
import { enrollUser, getGateway, getUsersAdminGateway, getWallet, registerAndEnrollUser } from "./network.js"

const app = express()

app.use(express.json())
app.use(async (req, res, next) => {
    const auth = req.header("Authorization")

    // struct of Authorization header:
    // Username <MSPID> <username>
    // example:
    // Username ShopsMSP admin
    if (auth) {
        const mspid = auth.split(" ")[1]
        const username = auth.split(" ")[2]

        const wallet = await getWallet()
        const identity = await wallet.get(`${mspid}-${username}`)

        if (!identity) {
            res.send("User not enrolled")
            res.status(401)
        }

        req.gateway = await getGateway(mspid, username)
    } else {
        req.gateway = await getUsersAdminGateway()
    }

    req.network = await req.gateway.getNetwork("wsr")
    req.chaincode = await req.network.getContract("cc")

    next()
})

app.get('/', (req, res) => {
    res.send('Hello world!')
})

app.post('/enroll', asyncRoute(async (req, res) => {
    const { mspid, id, secret } = req.body

    const result = await enrollUser(mspid, id, secret)
    res.send(result)
}))

app.post('/registerAndEnroll', asyncRoute(async (req, res) => {
    const { mspid, id, secret } = req.body

    const result = await registerAndEnrollUser(mspid, id, secret)
    res.send(result)
}))

app.get('/query', asyncRoute(async (req, res) => {
    const { args } = req.body
    const result = await req.chaincode.evaluateTransaction(args[0], args.slice(1))
    res.send(result)
}))

app.post('/invoke', asyncRoute(async (req, res) => {
    const { args, transient } = req.body
    const tx = await req.chaincode.createTransaction(args[0])
    if(transient) {
        for(const key in Object.keys(transient)) {
            transient[key] = Buffer.from(transient[key])
        }
    }
    const result = await tx.submit()
    res.send(result)
}))

app.listen(3000, () => console.log("[INFO] Listening on :3000"))