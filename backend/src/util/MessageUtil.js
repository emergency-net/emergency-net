import { base64toJson, sign } from "./CryptoUtil.js";
import { getApCert } from "../scripts/readcert.js";

export async function getKeyFromToken(token) {
  const fragmentedToken = token.split(".");
  const encodedData = fragmentedToken[0];
  const mtPubKeyToken = base64toJson(encodedData).mtPubKey.toString().trim();
  return mtPubKeyToken;
}

export function createMessageCert(message) {
  const messageStringified = JSON.stringify(message);
  const signed = sign(messageStringified);
  const cert = getApCert();

  return `${signed}.${cert}`;
}
