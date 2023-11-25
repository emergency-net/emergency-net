import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import sqlite3 from 'sqlite3';
import {open} from "sqlite";
import indexRouter from "./src/routes/index.js";
import AppDataSource from "./database/newDbSetup.js";
const app = express();

// view engine setup

app.use(indexRouter);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

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

let db;
const func = async () => {
   db = await open({
    filename: 'database/Emergency-Net-DB.db',
    driver: sqlite3.Database
  })
}



let sql = "SELECT * from  ap_private_keys";
func().then(async () => {

  console.log(await db.all(sql))
  
});



export default app;
