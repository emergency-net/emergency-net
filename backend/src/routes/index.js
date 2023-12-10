import express from "express";
import {
  getTokenData,
  privateDecrypt,
  sign,
  spkiToCryptoKey,
  verify,
} from "../util/CryptoUtil.js";

import { helloController } from "../controller/HelloController.js";
import { registerController } from "../controller/RegisterController.js";

import { AppDataSource } from "../database/newDbSetup.js";
import { getUser, putUser } from "../util/DatabaseUtil.js";
import { messageController } from "../controller/MessageController.js";
import { syncController } from "../controller/SyncController.js";
import { verifyToken } from "../util/HelloUtil.js";
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

export const authMiddleware = async (req, res, next) => {
  let auth = {
    tokenVerified: false,
    contentVerified: false,
    apVerified: false,
    errorMessage: "",
  };
  try {
    const token = req.header("authorization");

    if (!token) {
      throw new Error("Token does not exist");
    }
    const tokenData = await getTokenData(token);

    const tokenVerification = verifyToken(token);
    auth.tokenVerified = tokenVerification.isTokenVerified;
    auth.apVerified = tokenVerification.isApVerified;
    if (!auth.tokenVerified) {
      throw new Error(tokenVerification.reason);
    }

    if (!req.body) {
      throw new Error("There is no body.");
    }

    if (!req.body.signature || !req.body.content) {
      throw new Error("There is no content or signature in body.");
    }
    auth.contentVerified = verify(
      JSON.stringify(req.body.content),
      req.body.signature,
      tokenData.mtPubKey
    );
    if (!auth.contentVerified) {
      throw new Error("Content signature is invalid.");
    }

    auth = { ...tokenData, ...auth };
    req.body = req.body.content;
    req.auth = auth;

    console.log(auth);

    next();
  } catch (err) {
    auth.errorMessage = err.message;
    req.auth = auth;
    console.log(auth);

    next();
  }
};
/* GET home page. */
router.get("/", (req, res, next) => {
  res.send("<html><body><h1>Hello World!</h1></body></html>");
});

router.post("/register", registerController.register);

router.get("/hello", helloController.hello);
router.post("/message", messageController.receiveMessage);

router.post("/sync", syncController.sync);

export default router;
