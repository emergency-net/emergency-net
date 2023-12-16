import express from "express";

import { helloController } from "../controller/HelloController.js";
import { registerController } from "../controller/RegisterController.js";

import { messageController } from "../controller/MessageController.js";
import { syncController } from "../controller/SyncController.js";
const router = express.Router();

/* GET home page. */
router.get("/", (req, res, next) => {
  res.send("<html><body><h1>Hello World!</h1></body></html>");
});

router.post("/register", registerController.register);

router.get("/hello", helloController.hello);
router.post("/message", messageController.receiveMessage);

router.post("/sync", syncController.sync);

export default router;
