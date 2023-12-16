import createError from "http-errors";
import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";

import cors from "cors";
import "reflect-metadata";
import { responseInterceptor } from "./src/middleware/responseInterceptor.js";
import { authMiddleware } from "./src/middleware/authMiddleware.js";
import path from "path";
import indexRouter from "./src/routes/index.js";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

//import AppDataSource from "./database/newDbSetup.js";

const app = express();
// view engine setup
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors());

const baseUrl = process.env.BASE_URL || "/api";

app.use(baseUrl, indexRouter);
const dist = path.join(
  // @ts-ignore

  path.dirname(fileURLToPath(import.meta.url)),
  "dist"
);

app.get(/^\/assets\/.*/, express.static(dist));
app.get(/[\s\S]*/, (req, res, next) => {
  res.sendFile(dist + "/index.html");
});

export default app;
