import { apId } from "../../bin/www.js";
import { User } from "../database/entity/User.js";
import { AppDataSource } from "../database/newDbSetup.js";
import { jwkToKeyObject } from "../util/CryptoUtil.js";
import "../util/RegisterUtils.js";
import { createToken, generatePUCert } from "../util/RegisterUtils.js";
import { getAdminPublicKey } from "../scripts/readkeys.js";
import { useOneTimePassword } from "../util/PasswordUtil.js";

class RegisterController {
  async register(req, res, next) {
    const tod_reg = Date.now();
    let username = req.body.username;
    let mtPubKey = await jwkToKeyObject(req.body.mtPubKey);

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

      const mtPubBuffer = Buffer.from(
        mtPubKey.export({ format: "pem", type: "spki" })
      );
      const token = createToken(username, mtPubBuffer);

      let otp = req.body.password;
      if (otp !== undefined) {
        if (useOneTimePassword(otp)) {
          let puCert = await generatePUCert(mtPubKey);
          res.status(200).json({
            id: apId,
            tod: tod_reg,
            priority: -1,
            type: "MT_REG_ACK",
            adminPubKey: getAdminPublicKey().toString(),
            pu_cert: puCert,
            token: token,
          });
        } else {
          res.status(400).json({
            id: apId,
            tod: tod_reg,
            priority: -1,
            type: "MT_REG_RJT",
            username: username,
            error: "One time password is not verified.",
          });
        }
      } else {
        res.status(200).json({
          id: apId,
          tod: tod_reg,
          priority: -1,
          type: "MT_REG_ACK",
          adminPubKey: getAdminPublicKey().toString(),
          token: token,
        });
      }
    }
  }
}

export const registerController = new RegisterController();
