import Koa from 'koa'
import serve from 'koa-static'
import { koaBody } from 'koa-body'
import Router from '@koa/router'
import jwt from 'koa-jwt'
import pkg from 'jsonwebtoken'
const { sign } = pkg

const os = await import('node:os');
const arp = await import('node-arp');
const crypto = await import('node:crypto')
const webcrypto = crypto.webcrypto

var fs = await import('fs');
var path = await import('path');
var http = await import('http');
var https = await import('https');


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
          console.error(err)
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

    // console.log(ctx.request.body)
    const clientPublicKey = await webcrypto.subtle.importKey(
      'jwk',
      ctx.request.body.publicKey,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-512'
      },
      true,
      ['encrypt']
    )

    const encrypted = Buffer.from(await webcrypto.subtle.encrypt(
      {
        name: 'RSA-OAEP'
      },
      clientPublicKey,
      Buffer.from(token + ';' + new Date().toString())
    )).toString('base64')

    console.log(encrypted)
    ctx.type = 'application/json'
    ctx.body = {
      username: ctx.request.body.username,
      encryptedToken: encrypted
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

var config = {
  domain: 'localhost',
  http: {
    port: 8443,
  },
  https: {
    port: 3000,
    options: {
      key: fs.readFileSync(path.resolve(process.cwd(), 'server.key'), 'utf8').toString(),
      cert: fs.readFileSync(path.resolve(process.cwd(), 'server.pem'), 'utf8').toString(),
    },
  },
};

let serverCallback = app.callback();
try {
  var httpServer = http.createServer(serverCallback);
  httpServer
    .listen(config.http.port, function (err) {
      if (!!err) {
        console.error('HTTP server FAIL: ', err, (err && err.stack));
      }
      else {
        console.log(`HTTP  server OK: http://${config.domain}:${config.http.port}`);
      }
    });
}
catch (ex) {
  console.error('Failed to start HTTP server\n', ex, (ex && ex.stack));
}
try {
  var httpsServer = https.createServer(config.https.options, serverCallback);
  httpsServer
    .listen(config.https.port, function (err) {
      if (!!err) {
        console.error('HTTPS server FAIL: ', err, (err && err.stack));
      }
      else {
        console.log(`HTTPS server OK: https://${config.domain}:${config.https.port}`);
      }
    });
}
catch (ex) {
  console.error('Failed to start HTTPS server\n', ex, (ex && ex.stack));
}

export default app

//app.listen(3000)

