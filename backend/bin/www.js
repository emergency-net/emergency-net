#!/usr/bin/env node

/**
 * Module dependencies.
 */

import http from "http";
import dotenv from "dotenv";
import app from "../app.js";
import fs from "node:fs";
import crypto from "crypto";

dotenv.config();

const adminKey = fs.readFileSync(process.env.KEY_PATH);

app.set("adminKey", adminKey);

const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048, // Length of the key in bits
});

app.set(
  "privateKey",
  Buffer.from(privateKey.export({ format: "pem", type: "pkcs1" }))
);
app.set(
  "publicKey",
  Buffer.from(publicKey.export({ format: "pem", type: "pkcs1" }))
);

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
