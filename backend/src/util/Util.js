const DELAY = 3;
import { apId, publicKey } from "../../bin/www.js";
import { jsonToBase64, signByAdmin } from "./CryptoUtil.js";

export function checkTod(tod) {
  if ((Date.now() - tod) / 1000 > DELAY) {
    return false;
  }
  return true;
}

export function apCert() {
  const apContent = {
    apPub: publicKey.toString(),
    apId: "ortabayir",
  };
  const encodedApContent = jsonToBase64(apContent);
  const signedApContent = signByAdmin(JSON.stringify(apContent));
  var cert = `${encodedApContent}.${signedApContent}`;
}
