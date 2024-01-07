import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

export const apCert = fs.readFileSync(process.env.CERT_PATH).toString();

console.log("CERT READ");
