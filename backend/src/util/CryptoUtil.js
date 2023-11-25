import crypto from "crypto";
import { privateKey, adminKey } from "../../bin/www.js";

export function jsonToBase64(object) {
  const json = JSON.stringify(object);
  return Buffer.from(json).toString("base64");
}

export function base64toJson(base64String) {
  const json = Buffer.from(base64String, "base64").toString();
  return JSON.parse(json);
}

export function publicEncrypt(pubKey, token) {
  return crypto.publicEncrypt(pubKey, Buffer.from(token)).toString();
}

export function publicDecrypt(pubKey, token) {
  return crypto.publicDecrypt(pubKey, Buffer.from(token, "base64")).toString();
}

export function privateEncrypt(privateKey, token) {
  return crypto
    .privateEncrypt(privateKey, Buffer.from(token))
    .toString("base64");
}

export function privateDecrypt(privateKey, encryptedToken) {
  return crypto
    .privateDecrypt(privateKey, Buffer.from(encryptedToken))
    .toString();
}

export function sign(hash) {
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(hash);
  return sign.sign(privateKey, "base64");
}

// Admin-Certified AP
// TO-DO:: object equality check will be implemented
export function verifyACAP(data, encryptedData, adminKey) {
  return verifyAPIdentity(data, publicDecrypt(adminKey, encryptedData));
}

// PU-Certified AP
// TO-DO:: object equality check will be implemented
export function verifyPUAP(APData, encryptedAPData, PUData, encryptedPUData) {
  if (PUData == publicDecrypt(adminKey, encryptedPUData)) {
    const PUPubkey = PUData.PUPubkey;
    return APData == publicDecrypt(PUPubkey, encryptedAPData);
  }
  return false;
}

function verifyAPIdentity(obj1, obj2) {
  if (obj1 === undefined || obj2 === undefined) {
    return false;
  }
  return obj1.apId === obj2.apId && obj1.apPub === obj2.apPub;
}
