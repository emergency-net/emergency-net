import { verifyToken } from "../util/HelloUtil"

class HelloController {
    async hello(ctx) {
        let token = ctx.request.body.token
        if (token != null) {
            if (verifyToken(token)) {
                ctx.body = {
                    id: apName,
                    tod: tod_reg,
                    priority: -1,
                    type: "MT_HELLO_ACK",
                }
                ctx.status = 200
            } else {
                ctx.body = {
                    id: apName,
                    tod: tod_reg,
                    priority: -1,
                    type: "MT_HELLO_RJT",
                }
                ctx.status = 400
            }
        } else {
            ctx.body = {
                id: apName,
                tod: tod_reg,
                priority: -1,
                type: "MT_REG_PAGE",
            }
            ctx.status = 200
        }
    }
}