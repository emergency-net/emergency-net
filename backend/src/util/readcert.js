import fs from "fs";
import dotenv from "dotenv";
import { jsonToBase64, signByAdmin } from "./CryptoUtil.js";
import { publicKey } from "./readkeys.js";
dotenv.config();

function apCertFunc() {
  const apContent = {
    apPub: publicKey.toString(),
    apId: process.env.AP_ID,
  };
  const encodedApContent = jsonToBase64(apContent);
  const signedApContent = signByAdmin(JSON.stringify(apContent));
  return `${encodedApContent}.${signedApContent}`;
}

export const apCert = apCertFunc();

console.log("CERT READ");
