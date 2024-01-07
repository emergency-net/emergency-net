import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

let privateKey, publicKey, adminPublicKey, adminPrivateKey;

function readKeys() {
  privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH);
  publicKey = fs.readFileSync(process.env.PUBLIC_KEY_PATH);
  adminPublicKey = fs.readFileSync(process.env.ADMIN_PUBLIC_KEY_PATH);
  adminPrivateKey = fs.readFileSync(process.env.ADMIN_PRIVATE_KEY_PATH);
  console.log("KEYS READ");
}

// Initial read
readKeys();

// Function to re-read keys
export function reReadKeys() {
  readKeys();
}

// Export the keys as functions to ensure the latest values are returned
export function getPrivateKey() {
  return privateKey;
}

export function getPublicKey() {
  return publicKey;
}

export function getAdminPublicKey() {
  return adminPublicKey;
}

export function getAdminPrivateKey() {
  return adminPrivateKey;
}
