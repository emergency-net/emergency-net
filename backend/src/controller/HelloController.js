import { verifyToken } from "../util/HelloUtil.js"
import {apId} from "../../bin/www.js"

class HelloController {

    async  hello(req, res, next) {
        let token = req.body.token
        let tod_reg = Date.now();
        if (token != null) {
            if (verifyToken(token)) {
                res.body = {
                    id: apId,
                    tod: tod_reg,
                    priority: -1,
                    type: "MT_HELLO_ACK",
                }
                res.status = 200
            } else {
                res.body = {
                    id: apId,
                    tod: tod_reg,
                    priority: -1,
                    type: "MT_HELLO_RJT",
                }
                res.status = 400
            }
        } else {
            res.body = {
                id: apId,
                tod: tod_reg,
                priority: -1,
                type: "MT_REG_PAGE",
            }
            res.status = 200
        }
    }
}
export const helloController = new HelloController();