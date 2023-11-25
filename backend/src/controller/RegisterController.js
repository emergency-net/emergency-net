import { adminKey, apId, publicKey } from "../../bin/www";
import { publicEncrypt } from "../util/CryptoUtil";
import "../util/RegisterUtils";
import { createToken } from "../util/RegisterUtils.js";

class RegisterController {

    async register(req, res, next) {
        const tod_reg = Date.now();
        let username = req.body.username
        let mtPubKey = req.body.mtPubKey

        if (username === '' || users.has(username)) {
            res.body = {
                id: apId,
                tod: tod_reg,
                priority: -1,
                type: "MT_REG_RJT",
                username: username,
                error: 'Username already exists.'
            }
            res.status = 409
        }
        else {
            var token = createToken(username, mtPubKey);
            res.body = {
                id: apId,
                tod: tod_reg,
                priority: -1,
                type: "MT_REG_ACK",
                apPubKey: publicKey,
                adminPubKey: adminKey,
                yourToken: publicEncrypt(mtPubKey, token)
            }
            res.status = 200
        }

        return res;
    }

}
