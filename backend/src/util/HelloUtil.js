import { hashBase64 } from "./RegisterUtils";
import { base64toJson, publicDecrypt, verifyACAP, verifyPUAP } from "CryptoUtil";

export function verifyAPReg(data, cert) {

    var fragmentedCert = cert.split(".");
    var APData;
    if (fragmentedCert.length === 2) {
        APData = fragmentedCert[0];
        var encryptedData = fragmentedCert[1];
        isVerified = verifyACAP(APData, encryptedData);
    }
    else if (fragmentedCert.length === 4) {
        APData = fragmentedCert[0];
        var encryptedAPData = fragmentedCert[1];
        var PUData = fragmentedCert[2];
        var encryptedPUData = fragmentedCert[3];
        isVerified = verifyPUAP(APData, encryptedAPData, PUData, encryptedPUData);
    }

    var decodedData = base64toJson(data);
    return (isVerified && decodedData.APReg == APData.Id) ? APData.PubKey : -1;
}

export function verifyToken(token) {
    var fragmentedToken = token.split(".");
    var data = fragmentedToken[0];
    var encryptedData = fragmentedToken[1];
    var cert = fragmentedToken.slice(2).join('.');
    var APPubKey = verifyAPReg(data, cert);
    if (APPubKey > 0) {
        var decryptedHash = publicDecrypt(APPubKey, encryptedData);
        var hash = hashBase64(data);
        return hash === decryptedHash;
    }
    return false;
}

