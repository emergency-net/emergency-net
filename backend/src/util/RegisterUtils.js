import { apId, publicKey } from "../../bin/www.js";
import { jsonToBase64, sign, signByAdmin } from "./CryptoUtil.js";

export function createToken(mtUsername, mtPubKey) {
  const tod = Date.now();

  const registerContent = {
    apReg: apId,
    todReg: tod,
    mtUsername: mtUsername,
    mtPubKey: mtPubKey.toString(),
  };

  let registerContentStringified = JSON.stringify(registerContent);

  var encoded = jsonToBase64(registerContent);
  var signed = sign(registerContentStringified);

  const apContent = {
    apPub: publicKey.toString(),
    apId: "ortabayir",
  };
  const encodedApContent = jsonToBase64(apContent);
  const signedApContent = signByAdmin(JSON.stringify(apContent));
  var cert = `${encodedApContent}.${signedApContent}`;
  return `${encoded}.${signed}.${cert}`;
}
