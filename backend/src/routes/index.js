import express from "express";
import {
  privateEncrypt,
  publicDecrypt,
  publicEncrypt,
  sign,
  verify,
} from "../util/CryptoUtil.js";

import { karPubKey, privateKey, publicKey } from "../../bin/www.js";
import { helloController } from "../controller/HelloController.js";
import { createToken } from "../util/RegisterUtils.js";
import { verifyToken } from "../util/HelloUtil.js";
const router = express.Router();

/* GET home page. */
router.get("/", (req, res, next) => {
  res.send("<html><body><h1>Hello World!</h1></body></html>");
});

router.get("/hello", helloController.hello);

router.get("/test", (req, res, next) => {

  const encrypted = privateEncrypt(privateKey, "slm");
  const decrypted = publicDecrypt(publicKey, encrypted);
  const token = createToken("kardelen", karPubKey);
  const verified = verifyToken(token);
  //const signed = sign("slm");
  //const verified = verify("slm", signed, publicKey);
  res.send(JSON.stringify({ token, verified}));
});

export default router;
