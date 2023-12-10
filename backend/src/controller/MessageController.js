import { apId } from "../../bin/www.js";
import { createMessageCert } from "../util/MessageUtil.js";
import { AppDataSource } from "../database/newDbSetup.js";
import { Message } from "../database/entity/Message.js";
import {
  base64toJson,
  hashBase64,
  jsonToBase64,
  verify,
} from "../util/CryptoUtil.js";
import { checkTod } from "../util/Util.js";
import { verifyToken } from "../util/HelloUtil.js";

class MessageController {
  async receiveMessage(req, res, next) {
    let tod_received = req.body.tod;
    let message = req.body.message;
    console.log("Message received:", message);
    //let signature = req.body.signature;
    //let mtPubKeyJwk = req.body.mtPubKey;
    //const key = await jwkToKeyObject(mtPubKeyJwk);
    //const mtPubKey = getKeyFromToken(token);

    const messageToSave = {
      content: message.content,
      tod: message.tod,
      usernick: req.auth.mtUsername + "@" + req.auth.apReg,
      origin: apId,
    };

    if (!checkTod(tod_received)) {
      res.status(408).json({
        id: apId,
        tod: Date.now(),
        priority: -1,
        type: "MT_MSG_RJT",
        error: "Timeout error.",
      });
    } else {
      const isTokenVerified = req.auth.apVerified;
      const isAPVerified = req.auth.tokenVerified;

      const mtPubKey = req.auth.mtPubKey;

      if (!isTokenVerified) {
        res.status(400).json({
          id: apId,
          tod: Date.now(),
          priority: -1,
          type: "MT_MSG_RJT",
          error: req.auth.errorMessage
            ? req.auth.errorMessage
            : "Signature check is failed.",
        });
      } else {
        if (!req.auth.contentVerified) {
          res.status(400).json({
            id: apId,
            tod: Date.now(),
            priority: -1,
            type: "MT_MSG_RJT",
            error: "Message could not be verified.",
          });
        }
        AppDataSource.manager
          .save(Message, {
            content: message.content,
            usernick: message.usernick,
            origin: apId,
            certificate: createMessageCert(messageToSave),
            hashKey: hashBase64(jsonToBase64(messageToSave)),
            channel: message.channel,
            tod: tod_received,
            isSafe: isAPVerified,
          })
          .then((savedMessage) => {
            console.log("Message saved successfully:", savedMessage);
            res.status(200).json({
              id: apId,
              tod: Date.now(),
              priority: -1,
              type: "MT_MSG_ACK",
              usernick: message.usernick,
            });
          })
          .catch((error) => {
            console.error("Error saving message:", error);
            res.status(500).json({
              id: apId,
              tod: Date.now(),
              priority: -1,
              type: "MT_MSG_RJT",
              error: "Database error while saving message.",
            });
          });
      }
    }
  }
}

export const messageController = new MessageController();
