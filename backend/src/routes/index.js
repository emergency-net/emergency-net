import express from "express";
import {
  privateEncrypt,
  publicDecrypt,
  publicEncrypt,
  sign,
} from "../util/CryptoUtil.js";

import { privateKey, publicKey } from "../../bin/www.js";
const router = express.Router();

/* GET home page. */
router.get("/", (req, res, next) => {
  res.send("<html><body><h1>Hello World!</h1></body></html>");
});

router.get("/test", (req, res, next) => {

  const encrypted = privateEncrypt(privateKey, "slm");
  const decrypted = publicDecrypt(publicKey, encrypted);
  const signed = sign("slm");
  res.send(JSON.stringify({ encrypted, signed}));
});

export default router;
