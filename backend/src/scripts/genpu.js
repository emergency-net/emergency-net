import fs from "fs";
import crypto from "crypto";
import { jsonToBase64, signByAdmin } from "../util/CryptoUtil.js";
import dotenv from "dotenv";

const { subtle } = crypto.webcrypto;
dotenv.config();

const signAlgorithm = {
  name: "RSA-PSS",
  modulusLength: 2048,
  publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
  hash: "SHA-256",
  saltLength: 0,
};

async function generateAndSaveKeys() {
  // Generate an RSA key pair for signing
  const keyPair = await subtle.generateKey(signAlgorithm, true, [
    "sign",
    "verify",
  ]);

  // Export the private key
  const jwkPrivateKey = await subtle.exportKey("jwk", keyPair.privateKey);

  // Export the public key
  const jwkPublicKey = await subtle.exportKey("jwk", keyPair.publicKey);

  const pubPem = await convertCryptoKeyToPem(keyPair.publicKey);

  const puContent = {
    pubKey: pubPem,
  };
  const encodedPUContent = jsonToBase64(puContent);
  const signedPUContent = signByAdmin(JSON.stringify(puContent));
  const cert = `${encodedPUContent}.${signedPUContent}`;

  // Write keys to JSON files
  const path = process.env.PU_PATH || "./";
  fs.writeFileSync(`${path}/puCert.txt`, cert);
  fs.writeFileSync(`${path}/puPriv.json`, JSON.stringify(jwkPrivateKey));
  fs.writeFileSync(`${path}/puPub.json`, JSON.stringify(jwkPublicKey));
}

generateAndSaveKeys()
  .then(() => console.log("PU GENERATED"))
  .catch(console.error);

async function convertCryptoKeyToPem(cryptoKey) {
  // Export the CryptoKey to SPKI format
  const spki = await crypto.subtle.exportKey("spki", cryptoKey);

  // Convert the exported key to Base64
  const pem = Buffer.from(spki).toString("base64");

  // Split the string into 64-character lines
  const lines = pem.match(/.{1,64}/g).join("\n");

  // Wrap with PEM header and footer
  return `-----BEGIN PUBLIC KEY-----\n${lines}\n-----END PUBLIC KEY-----`;
}
