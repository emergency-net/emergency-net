import Koa from 'koa'
import serve from 'koa-static'
import { koaBody } from 'koa-body'
import Router from '@koa/router'

const app = new Koa()
const router = new Router()

app.use(serve('public'))

const messages = []
router.post('/send-message', koaBody(), async ctx => {
    messages.push(`${ctx.request.ip} says: ${ctx.request.body.message}`)
    console.log(ctx.request.body)
    ctx.type = 'application/json'
    ctx.body = messages
})
    .get('/messages', async ctx => {
        ctx.type = 'application/json'
        ctx.body = messages
    })

app.use(router.routes())

app.listen(3000)