import path from 'path'
import fs from "fs"
import { Gateway, Wallets } from 'fabric-network'
import { User } from 'fabric-common'
import FabricCA from "fabric-ca-client"
import { USERS_MSPID, SHOPS_MSPID, BANK_MSPID } from "./constant.js"

const convertToX509 = (mspId, enrollment) => {
    const { certificate, key } = enrollment

    return {
        credentials: {
            certificate, privateKey: key.toBytes()
        },
        mspId,
        type: 'X.509'
    }
}

export const getConnectionProfile = () =>
    JSON.parse(fs.readFileSync(path.join('cp.json')).toString())

let wallet;
export const getWallet = async () => {
    if(!wallet) wallet = await Wallets.newFileSystemWallet('wallet')
    return wallet
}

export const getCA = (mspid) => {
    const cp = getConnectionProfile()

    switch (mspid) {
        case USERS_MSPID: return new FabricCA(cp.certificateAuthorities["ca-org1"].url)
        case SHOPS_MSPID: return new FabricCA(cp.certificateAuthorities["ca-org2"].url)
        case BANK_MSPID: return new FabricCA(cp.certificateAuthorities["ca-org3"].url)
    }
}

export const getUsersAdminGateway = async () => {
    const admin = await getCA(USERS_MSPID).enroll({ enrollmentID: "admin", enrollmentSecret: "adminpw" })
    const identity = convertToX509(USERS_MSPID, admin)
    const wallet = await getWallet()

    if (await wallet.get("UsersMSP-admin")) await wallet.remove("UsersMSP-admin")
    await wallet.put("UsersMSP-admin", identity)

    const gateway = new Gateway()
    await gateway.connect(getConnectionProfile(), {
        identity: "UsersMSP-admin",
        wallet,
        discovery: {
            asLocalhost: false,
        }
    })

    return gateway
}

export const registerAndEnrollUser = async (mspid, id, secret) => {
    const ca = getCA(mspid)

    const admin = await ca.enroll({ enrollmentID: "admin", enrollmentSecret: "adminpw" })

    await ca.register({ enrollmentID: id, enrollmentSecret: secret, maxEnrollments: -1 }, User.createUser('admin', "adminpw", mspid, admin.certificate, admin.key.toBytes()))
    const user = await ca.enroll({ enrollmentID: id, enrollmentSecret: secret })
    const identityUser = convertToX509(mspid, user)

    const wallet = await getWallet()
    const label = `${mspid}-${id}`
    if (await wallet.get(label)) await wallet.remove(label)
    await wallet.put(label, identityUser)

    return { id, secret }
}

export const enrollUser = async (mspid, id, secret) => {
    const ca = getCA(mspid)
    const certificate = await ca.enroll({ enrollmentID: id, enrollmentSecret: secret })
    const x509 = convertToX509(mspid, certificate)

    const wallet = await getWallet()
    const label = `${mspid}-${id}`
    if (await wallet.get(label)) await wallet.remove(label)
    await wallet.put(label, x509)

    return x509
}

export const getGateway = async (mspid, id) => {
    const wallet = await getWallet()
    const gateway = new Gateway()
    await gateway.connect(getConnectionProfile(), {
        identity: `${mspid}-${id}`,
        wallet,
        discovery: {
            asLocalhost: false
        }
    })
    return gateway;
}