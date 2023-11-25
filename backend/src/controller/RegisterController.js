import "../util/RegisterUtils";
import { createToken } from "../util/RegisterUtils";

class RegisterController {

    async register(body, ctx) {
        const tod_reg = Date.now();
        let username = ctx.request.body.username
        let mtPubKey = ctx.request.body.mtPubKey

        if (username === '' || users.has(username)) {
            ctx.body = {
                id: apName,
                tod: tod_reg,
                priority: -1,
                type: "MT_REG_RJT",
                username: username,
                error: 'Username already exists.'
            }
            ctx.status = 409
        }
        else {
            var token = createToken(username, mtPubKey);
            ctx.body = {
                id: apName,
                tod: tod_reg,
                priority: -1,
                type: "MT_REG_ACK",
                apPubKey: apPubKey,
                adminPubKey: adminPubKey,
                yourToken: publicEncrypt(mtPubKey, Buffer.from(token))
            }
            ctx.status = 200
        }

        return ctx;
    }

}
