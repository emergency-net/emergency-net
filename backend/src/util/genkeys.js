import crypto, { createPublicKey } from "crypto";
import fs from "fs";

const BASE_PATH = "../../";

const { privateKey: privKey, publicKey: pubKey } = crypto.generateKeyPairSync(
  "rsa",
  {
    modulusLength: 2048, // Length of the key in bits
  }
);

const { privateKey: adminPrivKey, publicKey: adminPubKey } =
  crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048, // Length of the key in bits
  });
console.log("KEYS GENERATED");
fs.writeFileSync(
  BASE_PATH + process.env.PUBLIC_KEY_PATH,
  pubKey.export({ format: "pem", type: "spki" })
);
fs.writeFileSync(
  BASE_PATH + process.env.PRIVATE_KEY_PATH,
  privKey.export({ format: "pem", type: "pkcs8" })
);

fs.writeFileSync(
  BASE_PATH + process.env.ADMIN_PUBLIC_KEY_PATH,
  adminPubKey.export({ format: "pem", type: "spki" })
);
fs.writeFileSync(
  BASE_PATH + process.env.ADMIN_PRIVATE_KEY_PATH,
  adminPrivKey.export({ format: "pem", type: "pkcs8" })
);

console.log("KEYS SAVED");
