import Koa from 'koa'
import serve from 'koa-static'
import { koaBody } from 'koa-body'
import Router from '@koa/router'

const app = new Koa()
const router = new Router()

app.use(serve('public'))

const messages = []
router.post('/send-message', koaBody(), async ctx => {
    messages.push(ctx.request.body.message)
    ctx.type = 'text/html'
    ctx.body = ''
    for (const message of messages) {
        ctx.body += `<p>Your message was: ${message}<p>`
    }
    ctx.body += "<a href='/'><button>click to return</button></a>"
})

app.use(router.routes())

app.listen(3000)