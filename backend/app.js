import createError from "http-errors";
import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import indexRouter, { responseInterceptor } from "./src/routes/index.js";
import cors from "cors";
import "reflect-metadata";
import { AppDataSource } from "./src/database/newDbSetup.js";

//import AppDataSource from "./database/newDbSetup.js";

const app = express();
app.use(responseInterceptor);
// view engine setup
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors());

const baseUrl = process.env.BASE_URL || "/api";
app.use(baseUrl, indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  console.error(err);
  res.send(err);
});

const source = AppDataSource;

export default app;
