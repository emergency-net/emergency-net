import express from "express";

import { helloController } from "../controller/HelloController.js";
import { registerController } from "../controller/RegisterController.js";

import { messageController } from "../controller/MessageController.js";
import { syncController } from "../controller/SyncController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { responseInterceptor } from "../middleware/responseInterceptor.js";
const indexRouter = express.Router();

indexRouter.use(authMiddleware);
indexRouter.use(responseInterceptor);

indexRouter.post("/register", registerController.register);

indexRouter.get("/hello", helloController.hello);
indexRouter.post("/message", messageController.receiveMessage);

indexRouter.post("/sync", syncController.sync);

export default indexRouter;
