import dotenv from "dotenv";
import { jsonToBase64, signByAdmin } from "../util/CryptoUtil.js";
import fs from "fs";
import { getPublicKey } from "./readkeys.js";

dotenv.config();

function apCert() {
  const apContent = {
    apPub: getPublicKey().toString(),
    apId: process.env.AP_ID,
  };
  const encodedApContent = jsonToBase64(apContent);
  const signedApContent = signByAdmin(JSON.stringify(apContent));
  return `${encodedApContent}.${signedApContent}`;
}

fs.writeFileSync(process.env.CERT_PATH, apCert());
console.log("CERT SAVED");
