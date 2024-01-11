import crypto, { createHash } from "crypto";
import {
  getAdminPublicKey,
  getAdminPrivateKey,
  getPrivateKey,
} from "../scripts/readkeys.js";

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
  const signAlgorithm = {
    key: getPrivateKey(),
    saltLength: 0,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
  };
  return sign.sign(signAlgorithm, "base64");
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
    key: getAdminPrivateKey(),
    saltLength: 0,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
  };
  sign.end();
  return sign.sign(signAlgorithm, "base64");
}

export function verify(data, signature, publicKey) {
  const verify = crypto.createVerify("RSA-SHA256");
  verify.update(data);
  const signAlgorithm = {
    key: publicKey,
    saltLength: 0,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
  };
  const isVerified = verify.verify(signAlgorithm, signature, "base64");
  return isVerified;
}

export function hashBase64(base64String, algorithm = "sha256") {
  return createHash(algorithm).update(base64String).digest("base64");
}

// Admin-Certified AP
// TO-DO:: object equality check will be implemented
export function verifyACAP(encodedData, adminSignature) {
  const stringifiedData = JSON.stringify(base64toJson(encodedData));
  return verify(stringifiedData, adminSignature, getAdminPublicKey());
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
  if (verify(stringifiedPUData, adminSignature, getAdminPublicKey())) {
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

export function comparePEMStrings(pem1, pem2) {
  // Function to remove whitespace, headers, and footers
  const sanitizePEM = (pem) => {
    return pem
      .replace(/-----(BEGIN|END)[^-]*-----/g, "") // Remove headers and footers
      .replace(/\s+/g, ""); // Remove all whitespace
  };

  // Sanitize both PEM strings
  const sanitizedPem1 = sanitizePEM(pem1);
  const sanitizedPem2 = sanitizePEM(pem2);

  // Compare sanitized strings

  return sanitizedPem1 === sanitizedPem2;
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

export async function getTokenData(token) {
  const fragmentedToken = token.split(".");
  const encodedData = fragmentedToken[0];
  const data = base64toJson(encodedData);
  data.mtPubKey = data.mtPubKey.toString().trim();
  return data;
}
