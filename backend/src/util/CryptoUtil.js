import crypto, { createHash } from "crypto";
import { adminPublicKey, adminPrivateKey, privateKey } from "./readkeys.js";
import fs from "fs";

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

export function sign(data) {
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(data);
  return sign.sign(privateKey, "base64");
}

export function pemToPrivateKeyObject(pemContent) {
  try {
    const privateKey = crypto.createPublicKey({
      key: pemContent,
      format: "pem",
      type: "spki",
    });
    return privateKey;
  } catch (error) {
    console.error("Error converting PEM to Private KeyObject:", error);
    return null;
  }
}

export function signByAdmin(data) {
  const sign = crypto.createSign("RSA-SHA256");

  sign.update(data);
  const signAlgorithm = {
    key: adminPrivateKey,
    saltLength: 0,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
  };
  sign.end();
  return sign.sign(signAlgorithm, "base64");
}

export function verify(data, signature, publicKey) {
  const verify = crypto.createVerify("RSA-SHA256");
  verify.update(data);

  const isVerified = verify.verify(publicKey, signature, "base64");
  return isVerified;
}

export function hashBase64(base64String, algorithm = "sha256") {
  return createHash(algorithm).update(base64String).digest();
}

// Admin-Certified AP
// TO-DO:: object equality check will be implemented
export function verifyACAP(encodedData, adminSignature) {
  const stringifiedData = JSON.stringify(base64toJson(encodedData));
  return verify(stringifiedData, adminSignature, adminPublicKey);
}

// PU-Certified AP
export function verifyPUAP(
  encodedAPData,
  PUsignature,
  encodedPUData,
  adminSignature
) {
  const PUData = base64toJson(encodedPUData);
  const stringifiedPUData = JSON.stringify(PUData);
  if (verify(stringifiedPUData, adminSignature, adminPublicKey)) {
    const stringifiedAPData = JSON.stringify(base64toJson(encodedAPData));
    const PUkey = PUData.pubKey;
    return verify(stringifiedAPData, PUsignature, PUkey);
  }
  return false;
}

function verifyAPIdentity(obj1, obj2) {
  if (obj1 === undefined || obj2 === undefined) {
    return false;
  }
  return obj1.apId === obj2.apId && obj1.apPub === obj2.apPub;
}

export async function spkiToCryptoKey(spki) {
  const encryptAlgorithm = {
    name: "RSA-OAEP",
    modulusLength: 2048,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    hash: "SHA-256",
  };

  const bufferspki = Buffer.from(spki);
  const subtleKey = await crypto.subtle.importKey(
    "spki",
    bufferspki,
    encryptAlgorithm,
    true,
    ["decrypt"]
  );
  console.log(bufferspki);
  console.log(subtleKey);
  const keyObject = crypto.KeyObject.from(subtleKey);
  return keyObject;
}

export async function keyObjectToJwk(key) {
  return key.export({ format: "jwk" });
}

export async function jwkToKeyObject(jwk) {
  const signAlgorithm = {
    name: "RSA-PSS",
    modulusLength: 2048,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    hash: "SHA-256",
    saltLength: 0,
  };

  const CryptoKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    signAlgorithm,
    true,
    ["verify"]
  );

  const keyObject = crypto.KeyObject.from(CryptoKey);
  return keyObject;
}
