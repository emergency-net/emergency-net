import Koa from 'koa'
import serve from 'koa-static'
import { koaBody } from 'koa-body'
import Router from '@koa/router'
import jwt from 'koa-jwt'

import pkg from 'jsonwebtoken'
const { sign } = pkg

import os from 'node:os'

import https from 'node:https'
import fs from 'node:fs'
import crypto from 'node:crypto'

import * as dotenv from 'dotenv'

import winston from 'winston'
import { open } from 'sqlite'
import sqlite3 from 'sqlite3'
import { log } from 'node:console'
import forge from 'node-forge'


const DELAY = 3
dotenv.config()

// TODO env'den al daha sonra /etc/hostname 
const apName = "melihaktas"



const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { apName: apName },
    transports: [
        //
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new winston.transports.File({ filename: 'combined.log' }),
    ],
})

const db = await open({
    filename: 'database/Emergency-Net-DB.db',
    driver: sqlite3.Database
})
const apResult = await db.get(
    'SELECT private_key, public_key, ap_token FROM ap_private_keys WHERE ap_name = ?',
    apName
  );
  
const apToken = apResult.ap_token;
const apPublicKey = apResult.public_key;
const apPrivateKey = apResult.private_key;

// const apTokenFunc = async () => {
//     const { private_key } = await db.get('SELECT private_key FROM pu_private_keys WHERE pu_name = ?', "deneme@melihaktas")
//     const { public_key } = await db.get('SELECT public_key FROM ap_private_keys WHERE ap_name = ?', "ap2")
//     console.log(private_key, public_key)
//     const token = sign({
//         apPublicKey: public_key}, private_key, {
//         algorithm: 'RS256',
//         issuer: "deneme@melihaktas",
//         header: {
//             typ: 'JWT'
//         },
//         subject: "ap2"
//     })
//     return token
// };

// console.log(await apTokenFunc())

const app = new Koa()
const router = new Router()

app.use(serve('dist', { extensions: ['html', 'ico'] }))

app.use(jwt({
    secret: async (header, payload) => {
        const { public_key } = await db.get('SELECT public_key FROM ap_private_keys WHERE ap_name = ?', payload.iss)
        return public_key
    }
})
    .unless({ path: [/^\/register/ , /^\/temp/ , /^\/hello/ ]  }))
    

let messages = new Map([
    [process.env.CH1, new Map()],
    [process.env.CH2, new Map()],
    [process.env.CH3, new Map()],
    [process.env.CH4, new Map()],
    [process.env.CH5, new Map()]
])
const users = new Set()

router
    .post('/hello', koaBody(), async ctx => {
        ctx.type = 'application/json'
        
        if (ctx.request.body.token){
            if (token_jwt.mtPublicKey.replaceAll("\n", "") !== ctx.request.body.publicKey.replaceAll("\n", "")){
                console.log("Hello client key and token does not match!")
                ctx.body = {
                    id: apName,
                    tod: Date.now(),
                    priority: -1,
                    type: "MT_HELLO_RJT",
                    apToken: apToken,
                    APPublicKey: apPublicKey,
                    error: "Token is not valid"
                }
                ctx.status = 409
            }
            else {
                ctx.body = {
                    id: apName,
                    tod: Date.now(),
                    priority: -1,
                    type: "MT_HELLO_AGAIN",
                    apToken: apToken,
                    APPublicKeyList: "",
                    PUPublicKeyList: "",
                    APPublicKey: apPublicKey,
                    error: null
                }
                ctx.status = 409
            }

        }
        else{
            ctx.body = {
                id: apName,
                tod: Date.now(),
                priority: -1,
                type: "MT_HELLO_ACK",
                apToken: apToken,
                APPublicKeyList: "",
                PUPublicKeyList: "",
                APPublicKey: apPublicKey,
                error: null
            }
            ctx.status = 200
        }
    })

    .post('/register', koaBody(), async ctx => {
        ctx.type = 'application/json'
        let username = ctx.request.body.username
        if (username === '' || users.has(username)) {
            ctx.body = {
                id: apName,
                tod: Date.now(),
                priority: -1,
                type: "MT_REG_RJT",
                username: username,
                error: 'username already exists.'
            }
            ctx.status = 409
        } else {
            const token = sign({
                mtPublicKey: ctx.request.body.publicKey}, apPrivateKey, {
                algorithm: 'RS512',
                issuer: apName,
                header: {
                    typ: 'JWT'
                },
                subject: ctx.request.body.username
            })
            users.add(ctx.request.body.username)
            
            let id = username + "@" + apName 
            
            ctx.body = {
                id: apName,
                tod: Date.now(),
                priority: -1,
                type: "MT_REG_ACK",
                id: id,
                token: token,
                APPublicKeyList: "",
                PUPublicKeyList: "",
                error: null
            }
            ctx.status = 200
        }
    })
    .post('/new-message', koaBody(), async ctx => {
        const clientPublicKey = ctx.request.body.publicKey
        const username = ctx.request.body.username
        const signature = ctx.request.body.signature
        let packet = ctx.request.body.packet
        
        const verified = packetVerify(packet, clientPublicKey, signature);
        
        console.log('Signature verified:', verified);
        
        const token_jwt = pkg.decode(ctx.request.body.token)
        
        ctx.body = {
            id: apName,
            tod: Date.now(),
            priority: -1,
            username: username,
        }
        // Verify JWT
        const res = await db.get('SELECT public_key FROM ap_private_keys WHERE ap_name = ?', token_jwt.iss)
        if (!res){
            ctx.body["type"] =  "MT_MSG_RJT"
            ctx.body["error"] =  "Token is not signed by a known AP"
            console.log("Token is not signed by a known AP")
            console.log(token_jwt.mtPublicKey, clientPublicKey)
            ctx.status = 200
            return
        }
        else {
            // How to verify JWT
            await pkg.verify(ctx.request.body.token, res.public_key, (err, decoded) => {
                if (err) {
                    ctx.body["type"] =  "MT_MSG_RJT"
                    ctx.body["error"] =  "Token is not verified"
                    console.log("Token is not verified")
                    ctx.status = 200
                    return
                } else {
                  // Token verification successful
                }
              });
        }

        if (token_jwt.mtPublicKey.replaceAll("\n", "") !== clientPublicKey.replaceAll("\n", "")){
            ctx.body["type"] =  "MT_MSG_RJT"
            ctx.body["error"] =  "Public Keys does not match"
            console.log("public keys does not match ")
            console.log(token_jwt.mtPublicKey, clientPublicKey)
            ctx.status = 200
        }
        if (! verified){
            ctx.body["type"] =  "MT_MSG_RJT"
            ctx.body["error"] =  "Packet is changed"
            ctx.status = 200
        }
        if (! ctx.body.error){
            packet = JSON.parse(packet)

            if ( (Date.now() - packet.tod) / 1000 > DELAY){
                ctx.body["type"] =  "MT_MSG_RJT"
                ctx.body["error"] =  "Delay is too much"
                console.log("Delay is too much, ", Date.now() - packet.tod)
                ctx.status = 200
                return
            }
            const message = packet.message
            const channel = packet.channel
            
            messages.get(ctx.request.body.channel)
                .set(
                    // TODO add tod to locale string  
                    `${ctx.request.body.id} at ${new Date().toLocaleString()}: `,
                    message
                )
            logger.info(message + ' channel: [' + channel + ']')
    
            ctx.type = 'application/json'
            
            // TODO replace body and request to sync 
            ctx.body["type"] = "MT_MSG_ACK",
            ctx.status = 201
            ctx.body = JSON.stringify(Array.from(messages.get(channel)))
        }

    })
    .get('/sync/:ch', async ctx => {
        ctx.type = 'application/json'
        ctx.body = JSON.stringify(Array.from(messages.get(ctx.params.ch).keys()))
    })
    .post('/messages/:ch', koaBody(), async ctx => {
        const messagesNeeded = new Map()
        for (const key of ctx.request.body.keysNeeded) {
            messagesNeeded.set(key, messages.get(ctx.params.ch).get(key))
        }

        for (const message of ctx.request.body.newMessages) {
            messages.get(ctx.params.ch).set(message[0], message[1])
        }

        ctx.type = 'application/json'
        ctx.body = JSON.stringify(Array.from(messagesNeeded))
    })
    
    .post('/create-channel', koaBody(), async ctx => {

        const clientPublicKey = ctx.request.body.publicKey
        const id = ctx.request.body.id
        const signature = ctx.request.body.signature
        let packet = ctx.request.body.packet
        const verified = packetVerify(packet, clientPublicKey, signature);
        
        console.log('Signature verified:', verified);
        
        const token_jwt = pkg.decode(ctx.request.body.token)

        let res = await db.get('SELECT public_key FROM ap_private_keys WHERE ap_name = ?', token_jwt.iss)
        if (!res){
            ctx.body["type"] =  "CH_CREATE_RJT"
            ctx.body["error"] =  "Token is not signed by a known AP"
            console.log("Token is not signed by a known AP")
            console.log(token_jwt.mtPublicKey, clientPublicKey)
            ctx.status = 200
            return
        }
        else {
            // How to verify JWT
            await pkg.verify(ctx.request.body.token, res.public_key, (err, decoded) => {
                if (err) {
                    ctx.body["type"] =  "CH_CREATE_RJT"
                    ctx.body["error"] =  "Token is not verified"
                    console.log("Token is not verified")
                    ctx.status = 200
                    return
                } else {
                  // Token verification successful
                }
              });
        }


        // Check if this function works
        res =  await db.get('SELECT public_key FROM pu_private_keys WHERE pu_name = ?', id)
        ctx.body = {
            id: apName,
            tod: Date.now(),
            priority: -1,
            username: id,
        }
        
        if (!res){
            ctx.body.type =  "CH_CREATE_RJT"
            ctx.body.error =  "User is not a Privileged User"
            ctx.status = 200
            return
        }
        const public_key = res.public_key

        // TODOO check tod 
        if (token_jwt.mtPublicKey.replaceAll("\n", "") !== public_key.replaceAll("\n", "")){
            console.log("database")
            ctx.body["type"] =  "CH_CREATE_RJT"
            ctx.body["error"] =  "Database does not match"
            ctx.status = 200
        }
        if (token_jwt.mtPublicKey.replaceAll("\n", "") !== clientPublicKey.replaceAll("\n", "")){
            console.log("hayat")
            ctx.body["type"] =  "CH_CREATE_RJT"
            ctx.body["error"] =  "packages does not match"
            ctx.status = 200
        }
        if (! verified){
            ctx.body["type"] =  "CH_CREATE_RJT"
            ctx.body["error"] =  "Token is not valid"
            ctx.status = 200
        }
        if (! ctx.body.error){
            packet = JSON.parse(packet)
            
             //  E(JWTAPn, tod, Channels, Configurations)APnpriv
            const channel = packet.channel
            
            messages.set(channel, new Map())
            logger.info('New channel created: ' + channel )
            // Packet 1.a (Create  Channel ACK): (APn,tod, -1, CH_CREATE_ACK, JWTAPn, APpub,, E(JWTAPn, tod, Channels, Configurations)APnpriv )
            const responsePacket = {
                id: apToken,
                tod: Date.now(),
                channels: messages,
                configurations: "", 
            }

            let packetString = JSON.stringify(responsePacket)
            const signature = packetSign(packetString, apPrivateKey)
            ctx.type = 'application/json'

            // TODO PACKET LACK SMTH
            ctx.body = {
                id: apName,
                tod: Date.now(),
                priority: -1,
                token: apToken,
                apPublicKey: apPublicKey,
                signature: signature,
                packet: packetString
            }
            ctx.body["type"] = "CH_CREATE_ACK",
            ctx.status = 201
        }

    })
    .post('/destroy-channel', koaBody(), async ctx => {

        const clientPublicKey = ctx.request.body.publicKey
        const id = ctx.request.body.id
        const signature = ctx.request.body.signature
        let packet = ctx.request.body.packet
        const verified = packetVerify(packet, clientPublicKey, signature);
        
        console.log('Signature verified:', verified);
        
        const token_jwt = pkg.decode(ctx.request.body.token)

        let res = await db.get('SELECT public_key FROM ap_private_keys WHERE ap_name = ?', token_jwt.iss)
        if (!res){
            ctx.body["type"] =  "CH_DESTROY_RJT"
            ctx.body["error"] =  "Token is not signed by a known AP"
            console.log("Token is not signed by a known AP")
            console.log(token_jwt.mtPublicKey, clientPublicKey)
            ctx.status = 200
            return
        }
        else {
            // How to verify JWT
            await pkg.verify(ctx.request.body.token, res.public_key, (err, decoded) => {
                if (err) {
                    ctx.body["type"] =  "CH_DESTROY_RJT"
                    ctx.body["error"] =  "Token is not verified"
                    console.log("Token is not verified")
                    ctx.status = 200
                    return
                } else {
                  // Token verification successful
                }
              });
        }

        // Check if this function works
        res = await db.get('SELECT public_key FROM pu_private_keys WHERE pu_name = ?', id).catch( () =>{
            ctx.body["type"] =  "CH_DESTROY_RJT"
            ctx.body["error"] =  "User is not a Privileged User"
            ctx.status = 200
            return
        })

        // TODOO check tod 
        ctx.body = {
            id: apName,
            tod: Date.now(),
            priority: -1,
            username: id,
        }
        if (!res){
            ctx.body.type =  "CH_DESTROY_RJT"
            ctx.body.error =  "User is not a Privileged User"
            ctx.status = 200
            return
        }
        const public_key = res.public_key

        if (token_jwt.mtPublicKey.replaceAll("\n", "") !== public_key.replaceAll("\n", "")){
            console.log("database")
            ctx.body["type"] =  "CH_DESTROY_RJT"
            ctx.body["error"] =  "Database does not match"
            ctx.status = 200
        }
        if (token_jwt.mtPublicKey.replaceAll("\n", "") !== clientPublicKey.replaceAll("\n", "")){
            console.log("hayat")
            ctx.body["type"] =  "CH_DESTROY_RJT"
            ctx.body["error"] =  "packages does not match"
            ctx.status = 200
        }
        if (! verified){
            ctx.body["type"] =  "CH_DESTROY_RJT"
            ctx.body["error"] =  "Token is not valid"
            ctx.status = 200
        }
        if (! ctx.body.error){
            packet = JSON.parse(packet)
            
            const channel = packet.channel
            
            messages.delete(channel)
            logger.info('Channel destroyed: ' + channel )
            const responsePacket = {
                id: apToken,
                tod: Date.now(),
                channels: messages,
                configurations: "", 
            }

            let packetString = JSON.stringify(responsePacket)
            const signature = packetSign(packetString, apPrivateKey)
            ctx.type = 'application/json'

            // TODO PACKET LACK SMTH
            ctx.body = {
                id: apName,
                tod: Date.now(),
                priority: -1,
                token: apToken,
                apPublicKey: apPublicKey,
                signature: signature,
                packet: packetString
            }
            ctx.body["type"] = "CH_DESTROY_ACK",
            ctx.status = 201
        }

    })
    .post('/disable-ap', koaBody(), async ctx => {

        const clientPublicKey = ctx.request.body.publicKey
        const id = ctx.request.body.id
        const signature = ctx.request.body.signature
        let packet = ctx.request.body.packet
        const verified = packetVerify(packet, clientPublicKey, signature);
        
        console.log('Signature verified:', verified);
        
        const token_jwt = pkg.decode(ctx.request.body.token)
        let res = await db.get('SELECT public_key FROM ap_private_keys WHERE ap_name = ?', token_jwt.iss)
        if (!res){
            ctx.body["type"] =  "AP_DISABLE_RJT"
            ctx.body["error"] =  "Token is not signed by a known AP"
            console.log("Token is not signed by a known AP")
            console.log(token_jwt.mtPublicKey, clientPublicKey)
            ctx.status = 200
            return
        }
        else {
            // How to verify JWT
            await pkg.verify(ctx.request.body.token, res.public_key, (err, decoded) => {
                if (err) {
                    ctx.body["type"] =  "AP_DISABLE_RJT"
                    ctx.body["error"] =  "Token is not verified"
                    console.log("Token is not verified")
                    ctx.status = 200
                    return
                } else {
                  // Token verification successful
                }
              });
        }

        // Check if this function works
        res = await db.get('SELECT public_key FROM pu_private_keys WHERE pu_name = ?', id).catch( () =>{
            ctx.body["type"] =  "AP_DISABLE_RJT"
            ctx.body["error"] =  "User is not a Privileged User"
            ctx.status = 200
            return
        })

        // TODOO check tod 
        ctx.body = {
            id: apName,
            tod: Date.now(),
            priority: -1,
            username: id,
        }

        if (!res){
            ctx.body.type =  "AP_DISABLE_RJT"
            ctx.body.error =  "User is not a Privileged User"
            ctx.status = 200
            return
        }
        const public_key = res.public_key

        if (token_jwt.mtPublicKey.replaceAll("\n", "") !== public_key.replaceAll("\n", "")){
            console.log("database")
            ctx.body["type"] =  "AP_DISABLE_RJT"
            ctx.body["error"] =  "Database does not match"
            ctx.status = 200
        }
        if (token_jwt.mtPublicKey.replaceAll("\n", "") !== clientPublicKey.replaceAll("\n", "")){
            console.log("hayat")
            ctx.body["type"] =  "AP_DISABLE_RJT"
            ctx.body["error"] =  "packages does not match"
            ctx.status = 200
        }
        if (! verified){
            ctx.body["type"] =  "AP_DISABLE_RJT"
            ctx.body["error"] =  "Token is not valid"
            ctx.status = 200
        }
        if (! ctx.body.error){
            packet = JSON.parse(packet)
            
            const disableapName = packet.APName
            console.log(disableapName)

            await db.run('DELETE FROM ap_private_keys WHERE ap_name = ?', disableapName).catch( () =>{
                console.log("AP does not exists")
            })

            logger.info('AP Disabled: ' + disableapName )

            const responsePacket = {
                id: apToken,
                tod: Date.now(),
                configurations: "", 
            }

            let packetString = JSON.stringify(responsePacket)
            const signature = packetSign(packetString, apPrivateKey)
            ctx.type = 'application/json'

            ctx.body = {
                id: apName,
                tod: Date.now(),
                priority: -1,
                token: apToken,
                apPublicKey: apPublicKey,
                signature: signature,
                packet: packetString
            }
            ctx.body["type"] = "AP_DISABLE_ACK",
            ctx.status = 201
        }

    })
    .post('/disable-pu', koaBody(), async ctx => {

        const clientPublicKey = ctx.request.body.publicKey
        const id = ctx.request.body.id
        const signature = ctx.request.body.signature
        let packet = ctx.request.body.packet
        const verified = packetVerify(packet, clientPublicKey, signature);
        
        console.log('Signature verified:', verified);
        
        const token_jwt = pkg.decode(ctx.request.body.token)
        let res = await db.get('SELECT public_key FROM ap_private_keys WHERE ap_name = ?', token_jwt.iss)
        if (!res){
            ctx.body["type"] =  "PU_DISABLE_RJT"
            ctx.body["error"] =  "Token is not signed by a known AP"
            console.log("Token is not signed by a known AP")
            console.log(token_jwt.mtPublicKey, clientPublicKey)
            ctx.status = 200
            return
        }
        else {
            // How to verify JWT
            await pkg.verify(ctx.request.body.token, res.public_key, (err, decoded) => {
                if (err) {
                    ctx.body["type"] =  "PU_DISABLE_RJT"
                    ctx.body["error"] =  "Token is not verified"
                    console.log("Token is not verified")
                    ctx.status = 200
                    return
                } else {
                  // Token verification successful
                }
              });
        }

        // Check if this function works
        res = await db.get('SELECT public_key FROM pu_private_keys WHERE pu_name = ?', id).catch( () =>{
            ctx.body["type"] =  "PU_DISABLE_RJT"
            ctx.body["error"] =  "User is not a Privileged User"
            ctx.status = 200
            return
        })

        // TODOO check tod 
        ctx.body = {
            id: apName,
            tod: Date.now(),
            priority: -1,
            username: id,
        }

        if (!res){
            ctx.body.type =  "PU_DISABLE_RJT"
            ctx.body.error =  "User is not a Privileged User"
            ctx.status = 200
            return
        }
        const public_key = res.public_key

        if (token_jwt.mtPublicKey.replaceAll("\n", "") !== public_key.replaceAll("\n", "")){
            console.log("database")
            ctx.body["type"] =  "PU_DISABLE_RJT"
            ctx.body["error"] =  "Database does not match"
            ctx.status = 200
        }
        if (token_jwt.mtPublicKey.replaceAll("\n", "") !== clientPublicKey.replaceAll("\n", "")){
            console.log("hayat")
            ctx.body["type"] =  "PU_DISABLE_RJT"
            ctx.body["error"] =  "packages does not match"
            ctx.status = 200
        }
        if (! verified){
            ctx.body["type"] =  "PU_DISABLE_RJT"
            ctx.body["error"] =  "Token is not valid"
            ctx.status = 200
        }
        if (! ctx.body.error){
            packet = JSON.parse(packet)
            
            const disablepuName = packet.PUName
            console.log(disablepuName)
            
            // DELETE  FROM pu_private_keys WHERE pu_name = "kadir";
            await db.run('DELETE FROM pu_private_keys WHERE pu_name = ?', disablepuName).catch( () =>{
                console.log("User does not exists")
            })

            logger.info('AP Disabled: ' + disablepuName )
            const responsePacket = {
                id: apToken,
                tod: Date.now(),
                configurations: "", 
            }

            let packetString = JSON.stringify(responsePacket)
            const signature = packetSign(packetString, apPrivateKey)
            ctx.type = 'application/json'

            ctx.body = {
                id: apName,
                tod: Date.now(),
                priority: -1,
                token: apToken,
                apPublicKey: apPublicKey,
                signature: signature,
                packet: packetString
            }
            ctx.body["type"] = "PU_DISABLE_ACK",
            ctx.status = 201
        }

    })


app.use(router.routes())

https
    .createServer(
        {
            key: fs.readFileSync(process.env.KEY_PATH),
            cert: fs.readFileSync(process.env.CERT_PATH)
        },
        app.callback()
    )
    .listen(3000)

function packetVerify(packet, clientPublicKey, signature){
    const publicKeyObject = forge.pki.publicKeyFromPem(clientPublicKey);
    const md = forge.md.sha256.create();
    md.update(packet, 'utf8');
    const signature64 = forge.util.decode64(signature);
    return publicKeyObject.verify(md.digest().bytes(), signature64);
}

function packetSign(packetString, privateKey){
    const privateKeyObject = forge.pki.privateKeyFromPem(privateKey)
    const md = forge.md.sha256.create();
    md.update(packetString, 'utf8');
    const signature = privateKeyObject.sign(md);
    const signatureBase64 = forge.util.encode64(signature);
    return signatureBase64
}