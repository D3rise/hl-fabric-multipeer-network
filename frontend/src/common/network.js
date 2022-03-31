import { SERVER_URL } from "./constant"

export const query = async (identity, args) => {
    const result = await fetch(SERVER_URL + '/query', {
        method: 'GET',
        body: JSON.stringify({ args }),
        headers: identity ? {
            Authorization: `Username ${identity.mspid} ${identity.id}`
        } : undefined
    }).then(r => r.json())

    if (result.error) throw new Error(result.error)
    return result
}

export const invoke = async (identity, args) => {
    const result = await fetch(SERVER_URL + '/invoke', {
        method: 'POST',
        body: JSON.stringify({ args }),
        headers: identity ? {
            Authorization: `Username ${identity.mspid} ${identity.id}`
        } : undefined
    }).then(r => r.json())

    if (result.error) throw new Error(result.error)
    return result
}

export const enrollUser = async (mspid, id, secret) => {
    const result = await fetch(SERVER_URL + '/enroll', {
        method: 'POST',
        body: JSON.stringify({ mspid, id, secret })
    }).then(r => r.json())

    if (result.error) throw new Error(result.error)
    return result
}

export const registerAndEnrollUser = async (mspid, id, secret) => {
    const result = await fetch(SERVER_URL + '/registerAndEnroll', {
        method: 'POST',
        body: JSON.stringify({ mspid, id, secret })
    }).then(r => r.json())

    if (result.error) throw new Error(result.error)
    return result
}