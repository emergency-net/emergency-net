import { apId } from "../../bin/www.js";
import { jsonToBase64, sign, signByAdmin } from "./CryptoUtil.js";
import { apCert } from "./readcert.js";

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

  return `${encoded}.${signed}.${apCert}`;
}
