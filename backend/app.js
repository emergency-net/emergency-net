import createError from "http-errors";
import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";

import cors from "cors";
import "reflect-metadata";
import { responseInterceptor } from "./src/middleware/responseInterceptor.js";
import { authMiddleware } from "./src/middleware/authMiddleware.js";

//import AppDataSource from "./database/newDbSetup.js";

const app = express();
app.use(responseInterceptor);
// view engine setup
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors());
app.use(authMiddleware);

const baseUrl = process.env.BASE_URL || "/api";
// @ts-ignore
app.use(baseUrl, indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

export default app;
