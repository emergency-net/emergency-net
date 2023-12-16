import dotenv from "dotenv";
import { puPublicKey, publicKey } from "./readkeys.js";
import { jsonToBase64, signByAdmin } from "./CryptoUtil.js";
import fs from "fs";

dotenv.config();

function apCert() {
  const apContent = {
    apPub: publicKey.toString(),
    apId: process.env.AP_ID,
  };
  const encodedApContent = jsonToBase64(apContent);
  const signedApContent = signByAdmin(JSON.stringify(apContent));
  return `${encodedApContent}.${signedApContent}`;
}

function puCert() {
  const puContent = {
    puPub: puPublicKey.toString(),
  };
  const encodedPUContent = jsonToBase64(puContent);
  const signedPUContent = signByAdmin(JSON.stringify(puContent));
  return `${encodedPUContent}.${signedPUContent}`;
}

fs.writeFileSync(process.env.PU_CERT_PATH, puCert());
console.log("PU CERT SAVED");

fs.writeFileSync(process.env.CERT_PATH, apCert());
console.log("CERT SAVED");
