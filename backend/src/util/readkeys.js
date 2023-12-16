import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

export const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH);
export const publicKey = fs.readFileSync(process.env.PUBLIC_KEY_PATH);
export const adminPublicKey = fs.readFileSync(
  process.env.ADMIN_PUBLIC_KEY_PATH
);
export const adminPrivateKey = fs.readFileSync(
  process.env.ADMIN_PRIVATE_KEY_PATH
);
export const puPublicKey = fs.readFileSync(process.env.PU_PUBLIC_KEY_PATH);
export const puPrivateKey = fs.readFileSync(process.env.PU_PRIVATE_KEY_PATH);

console.log("KEYS READ");
