import { getTokenData, verify } from "../util/CryptoUtil.js";
import { verifyToken } from "../util/HelloUtil.js";

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

    console.log("AUTH: ", auth);

    next();
  } catch (err) {
    auth.errorMessage = err.message;
    if (req.body && req.body.content) {
      req.body = req.body.content;
    }

    req.auth = auth;
    console.log("AUTH: ", auth);

    next();
  }
};
