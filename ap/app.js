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

dotenv.config()

const apMac = os.networkInterfaces()[process.env.NET_INT]
    .find(addr => addr.family === 'IPv4')
    .mac

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { apMac: apMac },
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


const app = new Koa()
const router = new Router()

app.use(serve('dist', { extensions: ['html', 'ico'] }))

app.use(jwt({
    secret: async (header, payload) => {
        const { public_key } = await db.get('SELECT public_key FROM public_keys WHERE mac_id = ?', 'mac_0')

        return public_key
    }
})
    .unless({ path: [/^\/register/] }))

const messages = new Map([
    [process.env.CH1, new Map()],
    [process.env.CH2, new Map()],
    [process.env.CH3, new Map()],
    [process.env.CH4, new Map()],
    [process.env.CH5, new Map()]
])
const users = new Set()

router
    .post('/register', koaBody(), async ctx => {
        ctx.type = 'application/json'
        if (ctx.request.body.username === '' || users.has(ctx.request.body.username)) {
            ctx.body = {
                username: ctx.request.body.username,
                token: null,
                error: 'username already exists.'
            }
            ctx.status = 409
        } else {
            const { private_key } = await db.get('SELECT private_key FROM public_keys WHERE mac_id = ?', 'mac_0')
            const token = sign({}, private_key, {
                algorithm: 'RS512',
                issuer: 'mac_0',
                header: {
                    typ: 'JWT'
                },
                subject: ctx.request.body.username
            })

            users.add(ctx.request.body.username)

            ctx.body = {
                username: ctx.request.body.username,
                token: token,
                error: null
            }
        }
    })
    .post('/new-message/:ch', koaBody(), async ctx => {
        messages.get(ctx.params.ch)
            .set(
                `${ctx.state.user.sub}@${ctx.state.user.iss} at ${new Date().toLocaleString()}: `,
                ctx.request.body.message
            )

        logger.info(ctx.request.body.message + ' channel: [' + ctx.params.ch + ']')

        ctx.type = 'application/json'
        ctx.body = JSON.stringify(Array.from(messages.get(ctx.params.ch)))
        ctx.status = 201
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

app.use(router.routes())

https
    .createServer(
        {
            key: fs.readFileSync(process.env.KEY_PATH),
            cert: fs.readFileSync(process.env.CERT_PATH)
        },
        app.callback()
    )
    .listen(443)

