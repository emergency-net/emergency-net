import { apId } from "../../bin/www.js";
import { adminPublicKey } from "../scripts/readkeys.js";
import { getApCert } from "../scripts/readcert.js";

class HelloController {
  async hello(req, res, next) {
    let token = req.header("authorization");
    let tod = Date.now();
    if (token != null) {
      if (req.auth.tokenVerified) {
        // Correctly send the response
        res.status(200).json({
          id: apId,
          tod: tod,
          priority: -1,
          type: "MT_HELLO_ACK",
          cert: getApCert(),
          adminPubKey: adminPublicKey.toString(),
        });
      } else {
        // Correctly send the response with an error status
        res.status(400).json({
          id: apId,
          tod: tod,
          priority: -1,
          type: "MT_HELLO_RJT",
          error: req.auth.errorMessage
            ? req.auth.errorMessage
            : "Signature check for token has failed",
        });
      }
    } else {
      // Correctly send the response with a different status
      res.status(202).json({
        id: apId,
        tod: tod,
        priority: -1,
        type: "MT_HELLO_ACK",
        cert: getApCert(),
        adminPubKey: adminPublicKey.toString(),
      });
    }
  }
}

export const helloController = new HelloController();
