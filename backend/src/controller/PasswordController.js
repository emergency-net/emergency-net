import { apId } from "../../bin/www.js";
import { generateOneTimePassword } from "../util/PasswordUtil.js";
import { checkTod } from "../util/Util.js";

class PasswordController {
  async getPassword(req, res) {
    let tod_received = req.body.tod;
    if (!checkTod(tod_received)) {
      res.status(408).json({
        id: apId,
        tod: Date.now(),
        priority: -1,
        type: "MT_MSG_RJT",
        error: "Timeout error.",
      });
    } else {
      // create one time password
      const otp = generateOneTimePassword();
      console.log("OTP is: ", otp);

      if (otp != null && otp != "") {
        res.status(200).json({
          id: apId,
          tod: Date.now(),
          priority: -1,
          type: "MT_PSW_ACK",
        });
      } else {
        res.status(400).json({
          id: apId,
          tod: Date.now(),
          priority: -1,
          type: "MT_PSW_RJT",
          error: "One time password could not be generated.",
        });
      }
    }
  }
}
export const passwordController = new PasswordController();
