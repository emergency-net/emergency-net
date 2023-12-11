import { Message } from "../database/entity/Message.js";
import { AppDataSource } from "../database/newDbSetup.js";
import { verifyMessage } from "../util/MessageUtil.js";
import { findMissingMessages, messagesToMap } from "../util/SyncUtil.js";
import { checkTod } from "../util/Util.js";

class SyncController {
  async sync(req, res, next) {
    const receivedMessages = req.body.messages;
    const tod_received = req.body.tod;

    if (!checkTod(tod_received)) {
      return res.status(408).json({
        tod: Date.now(),
        priority: -1,
        type: "MT_SYNC_RJT",
        error: "Timeout error.",
      });
    }
    const channelMap = await messagesToMap();

    const missingMessages = await findMissingMessages(receivedMessages);

    missingMessages.forEach((message) => {
      verifyMessage(message);
      AppDataSource.manager.save(Message, message).catch((error) => {
        console.error("Error saving message:", error);
        res.status(500).json({
          tod: Date.now(),
          priority: -1,
          type: "MT_SYNC_RJT",
          error: "Database error while saving message.",
        });
      });
    });

    return res.status(200).json({
      tod: Date.now(),
      priority: -1,
      type: "MT_SYNC_ACK",
      content: {
        messages: channelMap,
      },
    });
  }
}

export const syncController = new SyncController();
