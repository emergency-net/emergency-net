import { apId } from "../../bin/www.js";
import { createMessageCert, verifyMT } from "../util/MessageUtil.js";
import { AppDataSource } from "../database/newDbSetup.js";
import { Message } from "../database/entity/Message.js";
import { hashBase64, jsonToBase64, verify } from "../util/CryptoUtil.js";
import { checkTod } from "../util/Util.js";
import { verifyToken } from "../util/HelloUtil.js";

class MessageController {

    async receiveMessage(req, res, next) {
      let token = req.header("authorization");
      let usernick = req.body.usernick;
      let tod_received = req.body.tod;
      let message = req.body.message;
      //let signature = req.body.signature;
      let mtPubKey = req.body.mtPubKey;

      const messageToSave = {
        content: message.content,
        tod: message.tod,
        usernick: usernick,
        origin: apId,
      }

      if(!checkTod(tod_received)) {
        res.status(408).json({
          id: apId,
          tod: Date.now(),
          priority: -1,
          type: "MT_MSG_RJT",
          error: "Timeout error.",
        });
      } else if (!verifyMT(token, mtPubKey)) {
        res.status(400).json({
          id: apId,
          tod: Date.now(),
          priority: -1,
          type: "MT_MSG_RJT",
          error: "MT Public Keys do not match.",
        });
      } 
      /*else if (!verify(message, signature, mtPubKey)) {
        res.status(400).json({
          id: apId,
          tod: Date.now(),
          priority: -1,
          type: "MT_MSG_RJT",
          error: "Message could not verified.",
        });
      }*/ else {
        const isVerified = verifyToken(token);
        const isTokenVerified = isVerified.isTokenVerified;
        const isAPVerified = isVerified.isAPVerified;
        if (!isTokenVerified) {
          res.status(400).json({
            id: apId,
            tod: Date.now(),
            priority: -1,
            type: "MT_MSG_RJT",
            error: isVerified.reason ? isVerified.reason : "Signature check is failed.",
          });
        } else {
          AppDataSource.manager
          .save(Message, {
              content: message.content,
              usernick: usernick,
              origin: apId,
              certificate: createMessageCert(messageToSave),
              hashKey: hashBase64(jsonToBase64(messageToSave)),
              channel: message.channel,
              tod: tod_received,
              isSafe: isAPVerified,
          }).then(savedMessage => {
            console.log('Message saved successfully:', savedMessage);
            res.status(200).json({
              id: apId,
              tod: Date.now(),
              priority: -1,
              type: "MT_MSG_ACK",
              usernick: usernick,
            });
          }).catch(error => {
            console.error('Error saving message:', error);
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