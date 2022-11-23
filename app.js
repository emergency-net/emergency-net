import Koa from 'koa'
import serve from 'koa-static'
import { koaBody } from 'koa-body'
import Router from '@koa/router'
import jwt from 'koa-jwt'
import pkg from 'jsonwebtoken';
const { sign } = pkg;
const os = await import('node:os');
const arp = await import('node-arp');

const app = new Koa()
const router = new Router()

const apMac = os.networkInterfaces()['Wi-Fi']
    .find(addr => addr.family === 'IPv4')
    .mac

app.use(serve('public', { extensions: ['html'] }))

app.use(jwt({
    secret: (header, payload) => {
        return 'shared-secret'
    }
}).unless({ path: [/^\/register/] }))

const messages = new Set()

router
    .post('/register', koaBody(), async ctx => {
        
        const clientIP = ctx.request.ip.split(':').slice(-1)[0]
        let clientMac = null
        if (clientIP !== '1') { // if not localhost
            arp.getMAC(clientIP, (err, mac) => {
                if (!err) {
                    clientMac = mac
                } else {
                    console.log(err)
                }
            })
        }
        const token = sign({ clientMac: clientMac }, 'shared-secret', {
            algorithm: 'HS512',
            issuer: apMac,
            header: {
                typ: 'JWT'
            },
            subject: ctx.request.body.username
        })
        ctx.type = 'application/json'
        ctx.body = {
            username: ctx.request.body.username,
            token: token
        }
    })
    .post('/send-message', koaBody(), async ctx => {
        messages.add(`From: ${ctx.state.user.sub}@${ctx.state.user.clientMac ?? 'localhost'}\nTo: ${apMac}\nAt: ${new Date()}\nMessage: ${ctx.request.body.message}`)
        ctx.type = 'application/json'
        ctx.body = JSON.stringify(Array.from(messages))
    })
    .get('/messages', async ctx => {
        ctx.type = 'application/json'
        ctx.body = JSON.stringify(Array.from(messages))
    })

app.use(router.routes())

app.listen(3000)