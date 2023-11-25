import { createHash } from "crypto";

export function createToken(mtUsername, mtPubKey) {
  const tod = Date.now();

  const registerContent = {
    apRegId: process.env.apId,
    todReg: tod,
    mtUsername: mtUsername,
    mtPubKey: mtPubKey,
  };

  var encoded = jsonToBase64(registerContent);
  var hashed = this.hashBase64(encoded);
  var signed = sign(hashed);

  return `${encoded}.${signed}.${cert}`;
}

export function hashBase64(
  base64String,
  algorithm = "sha256",
  encoding = "hex"
) {
  return createHash(algorithm).update(base64String).digest(encoding);
}

export function sign(hash) {
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(hash);
  return sign.sign(privateKey, "base64");
}

export function sign(hash) {
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(hash);
  return sign.sign(privateKey, "base64");
}
