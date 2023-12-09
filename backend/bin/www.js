#!/usr/bin/env node

/**
 * Module dependencies.
 */

import http from "http";
import dotenv from "dotenv";
import app from "../app.js";

dotenv.config();

export const apId = process.env.AP_ID;

if (!apId) {
  console.error("Please provide an AP_ID in your .env file.");
  process.exit(-1);
}
/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

/**
 * Basic Error Handling.
 */

// 404 Error Handler
app.use((req, res, next) => {
  res.status(404).send("Page not found");
});

// Generic Error Handler
app.use((err, req, res, next) => {
  console.error(err); // Log the error for debugging

  // Customize error message and status based on the error
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).send({
    error: {
      status,
      message,
    },
  });
});

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
