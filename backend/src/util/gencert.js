import dotenv from "dotenv";
import { publicKey } from "./readkeys.js";
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

fs.writeFileSync(process.env.CERT_PATH, apCert());
console.log("CERT SAVED");
