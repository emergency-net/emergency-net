import { verifyToken } from "../util/HelloUtil.js";
import { apId } from "../../bin/www.js";
import { adminPublicKey, privateKey } from "../util/readkeys.js";
import { sign } from "../util/CryptoUtil.js";
import { apCert } from "../util/readcert.js";

class HelloController {
  async hello(req, res, next) {
    let token = req.header("authorization");
    let tod = Date.now();
    let content;
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
        content = {
          id: apId,
          tod: tod,
          priority: -1,
          type: "MT_HELLO_RJT",
          error: verificationResult.reason
            ? verificationResult.reason
            : "Signature check is failed",
        };
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
      content = {
        id: apId,
        tod: tod,
        priority: -1,
        type: "MT_HELLO_ACK",
        cert: apCert,
        adminPubKey: adminPublicKey.toString(),
      };
      res.status(202).json({
        content: content,
        signature: sign(JSON.stringify(content)),
      });
    }
  }
}

export const helloController = new HelloController();
