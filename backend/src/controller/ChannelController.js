import { apId } from "../../bin/www.js";
import { Channel } from "../database/entity/Channel.js";
import { AppDataSource } from "../database/newDbSetup.js";
import { createMessageCert } from "../util/MessageUtil.js";
import { checkTod } from "../util/Util.js";

class ChannelController {
  async createChannel(req, res) {
    let tod_received = req.body.tod;

    if (!checkTod(tod_received)) {
      res.status(408).json({
        id: apId,
        tod: Date.now(),
        priority: -1,
        type: "CH_CREATE_RJT",
        error: "Timeout error.",
      });
    } else {
      if (!req.auth.tokenVerified) {
        res.status(400).json({
          id: apId,
          tod: Date.now(),
          priority: -1,
          type: "CH_CREATE_RJT",
          error: req.auth.errorMessage
            ? req.auth.errorMessage
            : "Signature check is failed.",
        });
      } else {
        if (req.auth.apVerified === "INVALID" || req.auth.apVerified === "NO_CERT") {
          res.status(400).json({
            id: apId,
            tod: Date.now(),
            priority: -1,
            type: "CH_CREATE_RJT",
            error: req.auth.errorMessage
              ? req.auth.errorMessage
              : "Signature check is failed.",
          });
        } else {
          if (!req.auth.puVerified) {
            res.status(400).json({
              id: apId,
              tod: Date.now(),
              priority: -1,
              type: "CH_CREATE_RJT",
              error: req.auth.errorMessage
                ? req.auth.errorMessage
                : "Signature check is failed.",
            });
          } else {
            if (
              req.channel_name === "" ||
              (await AppDataSource.manager.findOneBy(Channel, {
                channelName: req.channel_name,
              }))
            ) {
              res.status(409).json({
                id: apId,
                tod: Date.now(),
                priority: -1,
                type: "CH_CREATE_RJT",
                error: "Channel name already exists.",
              });
            } else {
              //Save channel to the database
              AppDataSource.manager
                .save(Channel, {
                  channelName: req.channel_name,
                  isActive: true,
                  channelCert: createMessageCert("$$OPEN_CHANNEL$$"),
                })
                .then(() => console.log("Channel saved to the database"));

              res.status(200).json({
                id: apId,
                tod: Date.now(),
                priority: -1,
                type: "CH_CREATE_ACK",
              });
            }
          }
        }
      }
    }
  }

  async destroyChannel(req, res) {
    let tod_received = req.body.tod;

    if (!checkTod(tod_received)) {
      res.status(408).json({
        id: apId,
        tod: Date.now(),
        priority: -1,
        type: "CH_DESTROY_RJT",
        error: "Timeout error.",
      });
    } else {
      if (!req.auth.tokenVerified) {
        res.status(400).json({
          id: apId,
          tod: Date.now(),
          priority: -1,
          type: "CH_DESTROY_RJT",
          error: req.auth.errorMessage
            ? req.auth.errorMessage
            : "Signature check is failed.",
        });
      } else {
        if (req.auth.apVerified === "INVALID" || req.auth.apVerified === "NO_CERT") {
          res.status(400).json({
            id: apId,
            tod: Date.now(),
            priority: -1,
            type: "CH_DESTROY_RJT",
            error: req.auth.errorMessage
              ? req.auth.errorMessage
              : "Signature check is failed.",
          });
        } else {
          if (!req.auth.puVerified) {
            res.status(400).json({
              id: apId,
              tod: Date.now(),
              priority: -1,
              type: "CH_DESTROY_RJT",
              error: req.auth.errorMessage
                ? req.auth.errorMessage
                : "Signature check is failed.",
            });
          } else {
            if (
              req.channel_name === "" ||
              !(await AppDataSource.manager.findOneBy(Channel, {
                channelName: req.channel_name,
              }))
            ) {
              res.status(409).json({
                id: apId,
                tod: Date.now(),
                priority: -1,
                type: "CH_DESTROY_RJT",
                error: "Channel name does not exist.",
              });
            } else {
              //Delete channel from the database
              AppDataSource.manager
                .update(
                  Channel,
                  { channelName: req.channel_name },
                  { isActive: false }
                )
                .then(() => console.log("Channel deleted from the database"));

              res.status(200).json({
                id: apId,
                tod: Date.now(),
                priority: -1,
                type: "CH_DESTROY_ACK",
              });
            }
          }
        }
      }
    }
  }
}
