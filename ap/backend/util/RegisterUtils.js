
class RegisterUtils {

    createToken (mtUsername, mtPubKey) {

        const tod = Date.now();

        const registerContent = {
            apRegId: process.env.apId,
            todReg: tod,
            mtUsername: mtUsername,
            mtPubKey: mtPubKey
        }

        var encoded = this.jsonToBase64(registerContent);

        return encoded;
    }

    jsonToBase64(object) {
        const json = JSON.stringify(object);
        return Buffer.from(json).toString("base64");
    }

    base64toJson(base64String) {
        const json = Buffer.from(base64String, "base64").toString();
        return JSON.parse(json);
    }


}