import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

let apCert;

function readCert() {
  apCert = fs.readFileSync(process.env.CERT_PATH).toString();
  console.log("CERT READ");
}

// Initial read
readCert();

// Function to re-read the certificate
export function reReadCert() {
  readCert();
}

// Export the certificate as a function to ensure the latest value is returned
export function getApCert() {
  return apCert;
}
