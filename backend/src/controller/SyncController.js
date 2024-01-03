import { Message } from "../database/entity/Message.js";
import { Channel } from "../database/entity/Channel.js";
import { AppDataSource } from "../database/newDbSetup.js";
import {
  getChannelsToSend,
  findMissingMessages,
  findMissingChannels,
  getMessagesToSend,
  verifyMessage,
  verifyChannel,
} from "../util/SyncUtil.js";
import { checkTod } from "../util/Util.js";

class SyncController {
  async sync(req, res, next) {
    const receivedMessages = req.body.messages;
    const receivedChannels = req.body.channels;
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

    const flattenedReceivedMessages = Object.values(receivedMessages).flatMap(
      (messages) => Object.values(messages)
    );

    const missingMessages = await findMissingMessages(
      flattenedReceivedMessages
    );
    const missingChannels = await findMissingChannels(receivedChannels);

    missingChannels.forEach((channel) => {
      const verificationResult = verifyChannel(channel);
      if (verificationResult.isChannelVerified) {
        if (channel.isActive) {
          AppDataSource.manager.save(Channel, channel).catch((error) => {
            console.error("Error saving channel:", error);
            res.status(500).json({
              tod: Date.now(),
              priority: -1,
              type: "MT_SYNC_RJT",
              error: "Database error while saving channel.",
            });
          });
        } else {
          AppDataSource.manager.update(
            Channel,
            { channelName: channel.channelName },
            channel
          );
        }
      }
    });

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

    const channelsToSend = await getChannelsToSend();

    const messagesToSend = await getMessagesToSend(receivedMessages);

    return res.status(200).json({
      tod: Date.now(),
      priority: -1,
      type: "MT_SYNC_ACK",
      content: {
        missingMessages: messagesToSend,
        unverifiedMessages: unverifiedMessages,
        channels: channelsToSend,
      },
    });
  }
}

export const syncController = new SyncController();
