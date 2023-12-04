import { verifyToken } from "../util/HelloUtil.js";
import { adminPublicKeyJwk, apId } from "../../bin/www.js";
import { apCert } from "../util/Util.js";

class HelloController {
  async hello(req, res, next) {
    let token = req.header("authorization");
    let tod = Date.now();

    if (token != null) {
      if (verifyToken(token)) {
        // Correctly send the response
        res.status(200).json({
          id: apId,
          tod: tod,
          priority: -1,
          type: "MT_HELLO_ACK",
          cert: apCert(),
          adminPubKey: adminPublicKeyJwk,
        });
      } else {
        // Correctly send the response with an error status
        res.status(400).json({
          id: apId,
          tod: tod,
          priority: -1,
          type: "MT_HELLO_RJT",
          error: "Invalid token.",
        });
      }
    } else {
      // Correctly send the response with a different status
      res.status(202).json({
        id: apId,
        tod: tod,
        priority: -1,
        type: "MT_REG_PAGE",
        cert: apCert(),
        adminPubKey: adminPublicKeyJwk,
      });
    }
  }
}

export const helloController = new HelloController();
