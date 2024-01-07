import dotenv from "dotenv";
import { publicKey } from "./readkeys.js";
import { jsonToBase64 } from "./CryptoUtil.js";
import fs from "fs";

dotenv.config();

function apNoCert() {
  const apContent = {
    apPub: publicKey.toString(),
    apId: process.env.AP_ID,
  };
  const encodedApContent = jsonToBase64(apContent);
  const noCert = "NO_CERT";
  return `${encodedApContent}.${noCert}`;
}

fs.writeFileSync(process.env.CERT_PATH, apNoCert());
console.log("INITIAL CERT SAVED");
