#!/usr/bin/env node

/**
 * Module dependencies.
 */

import http from "http";
import dotenv from "dotenv";
import app from "../app.js";
import crypto, { createPublicKey } from "crypto";
import fs from "fs";
import { pem2jwk } from "pem-jwk";

dotenv.config();

const { privateKey: privKey, publicKey: pubKey } = crypto.generateKeyPairSync(
  "rsa-pss",
  {
    modulusLength: 2048, // Length of the key in bits
  }
);

const { privateKey: adminPrivKey, publicKey: adminPubKey } =
  crypto.generateKeyPairSync("rsa-pss", {
    modulusLength: 2048, // Length of the key in bits
  });

const { privateKey: kardelenPrivKey, publicKey: kardelenPubKey } =
  crypto.generateKeyPairSync("rsa-pss", {
    modulusLength: 2048, // Length of the key in bits
  });

export const karPrivKey = Buffer.from(
  kardelenPrivKey.export({ format: "pem", type: "pkcs8" })
);

export const karPubKey = Buffer.from(
  kardelenPubKey.export({ format: "pem", type: "spki" })
);
//export const adminKey = fs.readFileSync(process.env.KEY_PATH);

export const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH);
export const publicKey = fs.readFileSync(process.env.PUBLIC_KEY_PATH);
export const adminKey = fs.readFileSync(process.env.ADMIN_PUBLIC_KEY_PATH);
export const adminPrivateKey = fs.readFileSync(
  process.env.ADMIN_PRIVATE_KEY_PATH
);

//console.log("Public", pem2jwk(publicKey.toString()));
function pemToPrivateKeyObject(pemFilePath) {
  try {
    const pemContent = fs.readFileSync(pemFilePath, "utf8");
    const privateKey = crypto.createPublicKey({
      key: pemContent,
      format: "pem",
      type: "spki",
    });
    return privateKey;
  } catch (error) {
    console.error("Error converting PEM to Private KeyObject:", error);
    return null;
  }
}
console.log(pemToPrivateKeyObject(process.env.PUBLIC_KEY_PATH));
console.log("HERE");
export const publicKeyJwk = pem2jwk(publicKey.toString());
export const adminPublicKeyJwk = pem2jwk(adminKey.toString());

export const apId = "ortabayir";
/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

/**
 * Create HTTP server.
 */

export const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  if (!addr) return;
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  console.log("Listening on " + bind);
}
