import { Message } from "../database/entity/Message.js";
import { AppDataSource } from "../database/newDbSetup.js";
import {
  findMissingMessages,
  getMessagesToSend,
  verifyMessage,
} from "../util/SyncUtil.js";
import { checkTod } from "../util/Util.js";

class SyncController {
  async sync(req, res, next) {
    const receivedMessages = req.body.messages;
    const tod_received = req.body.tod;
    const mtPubKey = req.body.mtPubKey;

    if (!checkTod(tod_received)) {
      return res.status(408).json({
        tod: Date.now(),
        priority: -1,
        type: "MT_SYNC_RJT",
        error: "Timeout error.",
      });
    }

    if (!req.auth.contentVerified) {
      res.status(400).json({
        tod: Date.now(),
        priority: -1,
        type: "MT_SYNC_RJT",
        error: req.auth.errorMessage
          ? req.auth.errorMessage
          : "Signature check is failed.",
      });
    }
    const messagesToSend = await getMessagesToSend(receivedMessages);

    const flattenedReceivedMessages = Object.values(receivedMessages).flatMap(
      (messages) => Object.values(messages)
    );

    const missingMessages = await findMissingMessages(
      flattenedReceivedMessages
    );
    const unverifiedMessages = {};

    missingMessages.forEach((message) => {
      const verificationResult = verifyMessage(message);
      if (verificationResult.isMessageVerified) {
        AppDataSource.manager.save(Message, message).catch((error) => {
          console.error("Error saving message:", error);
          res.status(500).json({
            tod: Date.now(),
            priority: -1,
            type: "MT_SYNC_RJT",
            error: "Database error while saving message.",
          });
        });
      } else {
        unverifiedMessages[message.channel] = message.hashKey;
      }
    });

    return res.status(200).json({
      tod: Date.now(),
      priority: -1,
      type: "MT_SYNC_ACK",
      content: {
        messages: messagesToSend,
        unverifiedMessages: unverifiedMessages,
      },
    });
  }
}

export const syncController = new SyncController();
