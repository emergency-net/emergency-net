import express from "express";
import {
  privateEncrypt,
  publicDecrypt,
  publicEncrypt,
} from "../util/CryptoUtil.js";
const router = express.Router();

/* GET home page. */
router.get("/", (req, res, next) => {
  res.send("<html><body><h1>Hello World!</h1></body></html>");
});

router.get("/test", (req, res, next) => {
  const adminKey = req.app.get("adminKey");
  const privateKey = req.app.get("privateKey");
  const publicKey = req.app.get("publicKey");

  const encrypted = privateEncrypt(privateKey, "slm");
  const decrypted = publicDecrypt(publicKey, encrypted);

  res.send(JSON.stringify({ encrypted, decrypted }));
});

export default router;
