import { apId } from "../../bin/www.js";
import { generateOneTimePassword } from "../util/PasswordUtil.js";

class PasswordController {
  async getPassword(req, res) {
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
export const passwordController = new PasswordController();
