import { apId } from "../../bin/www.js";
import { base64toJson, sign, verify } from "./CryptoUtil.js";
import { verifyAPReg, verifyToken } from "./HelloUtil.js";
import { apCert } from "./Util.js";

export function verifyMessage(message, mtPubKey, signature) {
    return verify(message, signature, mtPubKey);
}

export function verifyMT(token, mtPubKey) {
    var fragmentedToken = token.split(".");
    var encodedData = fragmentedToken[0];
   return verifyToken(token) && base64toJson(encodedData).mtPubKey.toString() == mtPubKey.toString();
}

export function createMessageCert(message) {
    
    const signed = sign(message);
    const cert = apCert();

    return `${signed}.${cert}`;
}  

