import { sign } from "crypto";
import { apId } from "../../bin/www.js";
import { createMessageCert, verifyMT, verifyMessage } from "../util/MessageUtil.js";
import { AppDataSource } from "../database/newDbSetup.js";
import { Message } from "../database/entity/Message.js";
import { verifyToken } from "../util/HelloUtil.js";
import { hashBase64, jsonToBase64, verify } from "../util/CryptoUtil.js";
import { checkTod } from "../util/Util.js";

class MessageController {
    async receiveMessage(req, res, next) {
      let usernick = req.body.usernick;
      let tod_received = req.body.tod;
      let message = req.body.message;
      let signature = req.body.signature;
      let mtPubKey = req.body.mtPubKey;
      let token = req.header("authorization");

      if (checkTod(tod_received) && verifyMT(token) && verify(message, signature, mtPubKey)) {

      let messageToSave = {
        content: message.content,
        tod: message.tod,
        usernick: usernick,
        origin: apId,
      }

      try{
        let result = await AppDataSource.manager
        .save(Message, {
            content: message.content,
            usernick: usernick,
            origin: apId,
            certificate: createMessageCert(messageToSave),
            hashKey: hashBase64(jsonToBase64(messageToSave)),
            channel: message.channel,
            tod: tod_received,
        })
        res.status(200).json({
          id: apId,
          tod: Date.now(),
          priority: -1,
          type: "MT_MSG_ACK",
          usernick: usernick,
        });
      } catch(error) {
        console.log(error);
      }

      return res;
    }
  }
}