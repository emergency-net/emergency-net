import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

export const apCert = fs.readFileSync(process.env.CERT_PATH).toString();

console.log("CERT READ");
