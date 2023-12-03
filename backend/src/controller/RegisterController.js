import { adminKey, apId, publicKey } from "../../bin/www.js";
import { User } from "../database/entity/User.js";
import { AppDataSource } from "../database/newDbSetup.js";
import { keyObjectToJwk } from "../util/CryptoUtil.js";
import "../util/RegisterUtils.js";
import { createToken } from "../util/RegisterUtils.js";

class RegisterController {
  async register(req, res, next) {
    const tod_reg = Date.now();
    let username = req.body.username;
    let mtPubKey = req.body.mtPubKey;

    if (
      username === "" ||
      (await AppDataSource.manager.findOneBy(User, {
        username: username,
      }))
    ) {
      res.status(409).json({
        id: apId,
        tod: tod_reg,
        priority: -1,
        type: "MT_REG_RJT",
        username: username,
        error: "Username already exists.",
      });
    } else {
      //Save username to the database
      AppDataSource.manager
        .save(User, {
          username: username,
        })
        .then(() => console.log("User saved to the database"));

      var token = createToken(username, mtPubKey);

      //Put token in the header
      //res.headers.authorization = "Bearer " + token;

      res.status(200).json({
        id: apId,
        tod: tod_reg,
        priority: -1,
        type: "MT_REG_ACK",
        apPubKey: keyObjectToJwk(publicKey),
        adminPubKey: keyObjectToJwk(adminKey),
        token: token,
      });
    }
  }
}

export const registerController = new RegisterController();
