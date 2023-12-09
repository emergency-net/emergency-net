import express from "express";
import { privateDecrypt, sign, spkiToCryptoKey } from "../util/CryptoUtil.js";

import { helloController } from "../controller/HelloController.js";
import { registerController } from "../controller/RegisterController.js";

import { AppDataSource } from "../database/newDbSetup.js";
import { getUser, putUser } from "../util/DatabaseUtil.js";
import { messageController } from "../controller/MessageController.js";
const router = express.Router();
export const responseInterceptor = (req, res, next) => {
  const json = res.json.bind(res);
  res.json = function (body) {
    const oldBody = body;
    const newBody = {
      content: oldBody,
      signature: sign(JSON.stringify(oldBody)),
    };
    return json(newBody);
  };
  next();
};
/* GET home page. */
router.get("/", (req, res, next) => {
  res.send("<html><body><h1>Hello World!</h1></body></html>");
});

router.post("/register", registerController.register);

router.get("/test", (req, res, next) => {
  // const encrypted = privateEncrypt(privateKey, "slm");
  //const decrypted = publicDecrypt(publicKey, encrypted);
  //const token = createToken("kardelen", karPubKey);
  //const verified = verifyToken(token);
  //const signed = sign("slm");
  //const verified = verify("slm", signed, publicKey);
  const mykey = spkiToCryptoKey(
    "P+m9h3l/jytEpa0Djri+aDwNw+CbD3sYTNS3gD3THfN1Ysfalwt9dYCZNnAWpAw0wavxtiRCV0FMpnlLXMVyq+iZvtqWtK0+ipnw5dqftBJuiwTjtm5PnSrk9Kv7xGE5mP+mQOnS3ilXxSTBgVpL4h+vc+dzstXingRXbFCANxqvIHfiVTBH+ayYNqO8CIOYID5trlATcsoJ+bn+NojI9AKK4VEkbfZWzrWALdHRkA+Pv/QfSMXdlYMrXTSicggE4M+C4rJZvHRdJBleFlKpa1+m4tyjOboHFhln/mRQAQbEgarJlK1wVEy8cLlKuarFhLSowmqb/KOzOehpR1AAUg=="
  );
  res.send(JSON.stringify({ mykey }));
});

router.post("/mtEncryptTest", async (req, res, next) => {
  const theirkey = await spkiToCryptoKey(req.body.key);
  const decrypted = privateDecrypt(theirkey, req.body.encrypted);
  //console.log(req.body.key);
  res.send(JSON.stringify({ decrypted }));
});

router.get("/test2", async (req, res, next) => {
  putUser({ username: "kardelen" });
  res.send(getUser("kardelen"));
});

router.get("/hello", helloController.hello);
router.post("/message", messageController.receiveMessage);

export default router;
