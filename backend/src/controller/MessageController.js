import { apId } from "../../bin/www.js";
import { createMessageCert, getKeyFromToken } from "../util/MessageUtil.js";
import { AppDataSource } from "../database/newDbSetup.js";
import { Message } from "../database/entity/Message.js";
import {
  base64toJson,
  hashBase64,
  jsonToBase64,
  jwkToKeyObject,
  verify,
} from "../util/CryptoUtil.js";
import { checkTod } from "../util/Util.js";
import { verifyToken } from "../util/HelloUtil.js";

class MessageController {
  async receiveMessage(req, res, next) {
    let token = req.header("authorization");
    const { content, signature } = req.body;
    let usernick = content.usernick;
    let tod_received = content.tod;
    let message = content.message;
    console.log("Message received:", message);
    //let signature = req.body.signature;
    //let mtPubKeyJwk = req.body.mtPubKey;
    //const key = await jwkToKeyObject(mtPubKeyJwk);
    //const mtPubKey = getKeyFromToken(token);

    const messageToSave = {
      content: message.content,
      tod: message.tod,
      usernick: message.usernick,
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
      const isVerified = verifyToken(token);
      const isTokenVerified = isVerified.isTokenVerified;
      const isAPVerified = isVerified.isApVerified;

      const encodedData = token.split(".")[0];
      const mtPubKey = base64toJson(encodedData).mtPubKey.toString().trim();

      if (!isTokenVerified) {
        res.status(400).json({
          id: apId,
          tod: Date.now(),
          priority: -1,
          type: "MT_MSG_RJT",
          error: isVerified.reason
            ? isVerified.reason
            : "Signature check is failed.",
        });
      } else {
        if (!verify(JSON.stringify(content), signature, mtPubKey)) {
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
