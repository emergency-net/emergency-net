import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

let privateKey, publicKey;
const adminPublicKey = fs.readFileSync(process.env.ADMIN_PUBLIC_KEY_PATH);
const adminPrivateKey = fs.readFileSync(process.env.ADMIN_PRIVATE_KEY_PATH);

function readKeys() {
  privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH);
  publicKey = fs.readFileSync(process.env.PUBLIC_KEY_PATH);
  console.log("Regular KEYS READ");
}

// Initial read
readKeys();

// Function to re-read regular keys
export function reReadKeys() {
  readKeys();
}

// Export the regular keys as functions to ensure the latest values are returned
export function getPrivateKey() {
  return privateKey;
}

export function getPublicKey() {
  return publicKey;
}
export function getAdminPublicKey() {
  return adminPublicKey;
}

// Export the admin keys as constants
export { adminPrivateKey };
