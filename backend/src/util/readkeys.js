import fs from "fs";
const BASE_PATH = "../../";

export const privateKey = fs.readFileSync(
  BASE_PATH + process.env.PRIVATE_KEY_PATH
);
export const publicKey = fs.readFileSync(
  BASE_PATH + process.env.PUBLIC_KEY_PATH
);
export const adminKey = fs.readFileSync(
  BASE_PATH + process.env.ADMIN_PUBLIC_KEY_PATH
);
export const adminPrivateKey = fs.readFileSync(
  BASE_PATH + process.env.ADMIN_PRIVATE_KEY_PATH
);

console.log("KEYS READ");
