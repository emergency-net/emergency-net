import crypto from "crypto";
import fs from "fs";
import dotenv from "dotenv";
import { getPublicKey, reReadKeys } from "../scripts/readkeys.js";
import { jsonToBase64, jwkToKeyObject } from "../util/CryptoUtil.js";
import { checkTod } from "../util/Util.js";
import { reReadCert } from "../scripts/readcert.js";
dotenv.config();

class CertifyController {
  async requestToCertify(req, res) {
    let tod_received = req.body.tod;
    if (!checkTod(tod_received)) {
      res.status(408).json({
        tod: Date.now(),
        priority: -1,
        type: "MT_AP_CERT_RJT",
        error: "Timeout error.",
      });
    }
    const adminPubKey = await jwkToKeyObject(req.body.adminPubKey);
    if (req.auth.puCert) {
      fs.writeFileSync(
        process.env.ADMIN_PUBLIC_KEY_PATH,
        adminPubKey.export({ format: "pem", type: "spki" })
      );

      const { privateKey: privKey, publicKey: pubKey } =
        crypto.generateKeyPairSync("rsa", {
          modulusLength: 2048, // Length of the key in bits
        });

      fs.writeFileSync(
        process.env.PUBLIC_KEY_PATH,
        pubKey.export({ format: "pem", type: "spki" })
      );
      fs.writeFileSync(
        process.env.PRIVATE_KEY_PATH,
        privKey.export({ format: "pem", type: "pkcs8" })
      );

      reReadKeys();

      const apContent = {
        apPub: getPublicKey().toString(),
        apId: process.env.AP_ID,
      };
      const encodedApContent = jsonToBase64(apContent);
      res.status(200).json({
        priority: -1,
        type: "MT_AP_CERT_ACK",
        tod: Date.now(),
        apContent: encodedApContent,
      });
    } else {
      res.status(400).json({
        priority: -1,
        type: "MT_AP_CERT_RJT",
        tod: Date.now(),
        error: req.auth.errorMessage ?? "PU certificate is not verified.",
      });
    }
  }

  async certify(req, res) {
    let tod_received = req.body.tod;
    if (!checkTod(tod_received)) {
      res.status(408).json({
        tod: Date.now(),
        priority: -1,
        type: "MT_AP_CERT_RJT",
        error: "Timeout error.",
      });
    }

    if (req.auth.puVerified && req.auth.puCert) {
      const apContent = {
        apPub: getPublicKey().toString(),
        apId: process.env.AP_ID,
      };
      const encodedApContent = jsonToBase64(apContent);

      const signedApContent = req.body.signedApContent;

      const apCert = `${encodedApContent}.${signedApContent}.${req.auth.puCert}`;

      fs.writeFileSync(process.env.CERT_PATH, apCert);
      reReadCert();
      res.status(200).json({
        type: "MT_AP_CERT_ACK",
        priority: -1,
        tod: Date.now(),
        apPub: getPublicKey().toString(),
        apId: process.env.AP_ID,
      });
    } else {
      res.status(400).json({
        priority: -1,
        type: "MT_AP_CERT_RJT",
        tod: Date.now(),
        error: req.auth.errorMessage ?? "PU certificate is not verified.",
      });
    }
  }
}

export const certifyController = new CertifyController();
