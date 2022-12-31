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

app.use(serve('public', { extensions: ['html'] }))

app.use(jwt({
    secret: (header, payload) => {
        return 'shared-secret'
    }
})
    .unless({ path: [/^\/register/] }))

const messages = new Set()
const users = new Map()

router
    .post('/register', koaBody(), async ctx => {
        ctx.type = 'application/json'
        let token = users.get(ctx.request.body.username)
        if (token) {
            ctx.body = {
                username: ctx.request.body.username,
                token: token,
                error: true
            }
        } else {
            token = sign({}, 'shared-secret', {
                algorithm: 'HS512',
                issuer: apMac,
                header: {
                    typ: 'JWT'
                },
                subject: ctx.request.body.username
            })

            users.set(ctx.request.body.username, token)

            ctx.body = {
                username: ctx.request.body.username,
                token: token,
                error: false
            }
        }
    })
    .post('/send-message', koaBody(), async ctx => {
        for (const message of ctx.request.body.messages) {
            messages.add(message)
        }
        messages.add(`From: ${ctx.state.user.sub}@${ctx.state.user.clientMac ?? 'localhost'}\nTo: ${apMac}\nAt: ${new Date()}\nMessage: ${ctx.request.body.message}`)
        ctx.type = 'application/json'
        ctx.body = JSON.stringify(Array.from(messages))
    })
    .post('/messages', koaBody(), async ctx => {
        for (const message of ctx.request.body.messages) {
            messages.add(message)
        }
        ctx.type = 'application/json'
        ctx.body = Array.from(messages)
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
