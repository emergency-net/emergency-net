import crypto from "crypto";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const { privateKey: adminPrivKey, publicKey: adminPubKey } =
  crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048, // Length of the key in bits
  });

fs.writeFileSync(
  process.env.ADMIN_PUBLIC_KEY_PATH,
  adminPubKey.export({ format: "pem", type: "spki" })
);
fs.writeFileSync(
  process.env.ADMIN_PRIVATE_KEY_PATH,
  adminPrivKey.export({ format: "pem", type: "pkcs8" })
);

console.log("ADMIN SAVED");
