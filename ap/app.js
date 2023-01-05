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
import * as dotenv from 'dotenv'

dotenv.config()

const app = new Koa()
const router = new Router()

const apMac = os.networkInterfaces()[process.env.NET_INT]
    .find(addr => addr.family === 'IPv4')
    .mac

app.use(serve('dist', { extensions: ['html', 'ico'] }))

app.use(jwt({
    secret: (header, payload) => {
        return 'shared-secret'
    }
})
    .unless({ path: [/^\/register/] }))

const messages = new Map([
    ['1', new Map()],
    ['2', new Map()],
    ['3', new Map()]
])
const users = new Set()

router
    .post('/register', koaBody(), async ctx => {
        ctx.type = 'application/json'
        if (users.has(ctx.request.body.username)) {
            ctx.body = {
                username: ctx.request.body.username,
                token: null,
                error: true
            }
        } else {
            const token = sign({}, 'shared-secret', {
                algorithm: 'HS512',
                issuer: apMac,
                header: {
                    typ: 'JWT'
                },
                subject: ctx.request.body.username
            })

            users.add(ctx.request.body.username)

            ctx.body = {
                username: ctx.request.body.username,
                token: token,
                error: false
            }
        }
    })
    .post('/new-message/:ch', koaBody(), async ctx => {
        messages.get(ctx.params.ch)
            .set(
                [new Date().toISOString(), ctx.state.user.sub, ctx.state.user.iss].join(';'),
                ctx.request.body.message
            )
        ctx.type = 'application/json'
        ctx.body = JSON.stringify(Array.from(messages.get(ctx.params.ch)))
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
