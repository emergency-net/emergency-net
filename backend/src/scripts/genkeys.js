import crypto from "crypto";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const { privateKey: privKey, publicKey: pubKey } = crypto.generateKeyPairSync(
  "rsa",
  {
    modulusLength: 2048, // Length of the key in bits
  }
);

console.log("KEYS GENERATED");
fs.writeFileSync(
  process.env.PUBLIC_KEY_PATH,
  pubKey.export({ format: "pem", type: "spki" })
);
fs.writeFileSync(
  process.env.PRIVATE_KEY_PATH,
  privKey.export({ format: "pem", type: "pkcs8" })
);

console.log("KEYS SAVED");
