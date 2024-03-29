import {
  base64toJson,
  comparePEMStrings,
  getTokenData,
  verify,
} from "../util/CryptoUtil.js";
import { verifyToken } from "../util/HelloUtil.js";
import { getAdminPublicKey } from "../scripts/readkeys.js";
import { AppDataSource } from "../database/newDbSetup.js";
import { BlacklistedPU } from "../database/entity/BlacklistedPU.js";

export const authMiddleware = async (req, res, next) => {
  let auth = {
    tokenVerified: false,
    contentVerified: false,
    apVerified: "INVALID",
    puVerified: false,
    errorMessage: "",
    puCert: "",
    applicable: true,
  };
  try {
    if (getAdminPublicKey() === null) {
      auth.applicable = false;
    }
    const token = req.header("authorization");

    if (!token) {
      throw new Error("Token does not exist");
    }
    const tokenData = await getTokenData(token);
    console.log("TOKEN DATA: ", tokenData);
    const tokenVerification = verifyToken(token, auth.applicable);
    auth.tokenVerified = tokenVerification.isTokenVerified;
    auth.apVerified = tokenVerification.isApVerified;
    if (!auth.tokenVerified) {
      throw new Error(tokenVerification.reason);
    }

    if (!req.body?.signature || !req.body?.content) {
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

    if (req.body.pu_cert) {
      if (tokenData.mtUsername && tokenData.apReg) {
        let nickname = tokenData.mtUsername + "@" + tokenData.apReg;
        if (
          await AppDataSource.manager.findOneBy(BlacklistedPU, {
            puNickname: nickname,
          })
        ) {
          auth.puVerified = false;
          throw new Error("PU is blacklisted.");
        }
      }
      auth.puCert = req.body.pu_cert;
      const fragmentedPUCert = req.body.pu_cert.split(".");
      if (fragmentedPUCert.length != 2) {
        throw new Error("PU certificate is not in the correct format.");
      }
      let puContent = base64toJson(fragmentedPUCert[0]);
      let puSignature = fragmentedPUCert[1];
      if (!puContent.pubKey) {
        throw new Error("PU certificate does not contain public key.");
      }
      let pu_pub_cert = puContent.pubKey;
      let pu_pub_token = tokenVerification.mtPubKey
        ? tokenVerification.mtPubKey
        : "";

      if (!comparePEMStrings(pu_pub_cert, pu_pub_token)) {
        throw new Error("PU certificate does not match token.");
      }
      if (auth.applicable) {
        auth.puVerified = verify(
          JSON.stringify(puContent),
          puSignature,
          getAdminPublicKey()
        );
      }

      if (!req.body) {
        throw new Error("There is no body.");
      }
    }

    auth = { ...tokenData, ...auth };
    req.body = req.body.content;
    req.auth = auth;

    console.log("AUTH: ", auth);

    next();
  } catch (err) {
    console.error(err);
    auth.errorMessage = err.message;
    if (req.body && req.body.content) {
      req.body = req.body.content;
    }

    req.auth = auth;
    console.log("AUTH: ", auth);

    next();
  }
};
