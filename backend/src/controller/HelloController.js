import { verifyToken } from "../util/HelloUtil.js";
import { apId } from "../../bin/www.js";

class HelloController {
  async hello(req, res, next) {
    let token = req.header("authorization");
    let tod = Date.now();
    if (token != null) {
      if (verifyToken(token)) {
        res.body = {
          id: apId,
          tod: tod,
          priority: -1,
          type: "MT_HELLO_ACK",
        };
        res.status = 200;
      } else {
        res.body = {
          id: apId,
          tod: tod,
          priority: -1,
          type: "MT_HELLO_RJT",
          error: "Invalid token.",
        };
        res.status = 400;
      }
    } else {
      res.body = {
        id: apId,
        tod: tod,
        priority: -1,
        type: "MT_REG_PAGE",
      };
      res.status = 202;
    }
  }
}
export const helloController = new HelloController();
