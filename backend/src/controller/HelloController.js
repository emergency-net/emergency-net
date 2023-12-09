import { verifyToken } from "../util/HelloUtil.js";
import { apId } from "../../bin/www.js";
import { adminPublicKey } from "../util/readkeys.js";
import { apCert } from "../util/readcert.js";

class HelloController {
  async hello(req, res, next) {
    let token = req.header("authorization");
    let tod = Date.now();
    if (token != null) {
      const verificationResult = verifyToken(token);
      if (verificationResult.isTokenVerified) {
        // Correctly send the response
        res.status(200).json({
          id: apId,
          tod: tod,
          priority: -1,
          type: "MT_HELLO_ACK",
          cert: apCert,
          adminPubKey: adminPublicKey.toString(),
        });
      } else {
        // Correctly send the response with an error status
        res.status(400).json({
          id: apId,
          tod: tod,
          priority: -1,
          type: "MT_HELLO_RJT",
          error: verificationResult.reason
            ? verificationResult.reason
            : "Signature check is failed",
        });
      }
    } else {
      // Correctly send the response with a different status
      res.status(202).json({
        id: apId,
        tod: tod,
        priority: -1,
        type: "MT_HELLO_ACK",
        cert: apCert,
        adminPubKey: adminPublicKey.toString(),
      });
    }
  }
}

export const helloController = new HelloController();
