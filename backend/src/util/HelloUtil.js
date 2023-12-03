import { base64toJson, verify, verifyACAP, verifyPUAP } from "./CryptoUtil.js";

export function verifyAPReg(data, cert) {
  let isVerified = false;
  var fragmentedCert = cert.split(".");
  var encodedAPData;
  console.log("fragmented cert " + fragmentedCert);
  if (fragmentedCert.length === 2) {
    encodedAPData = fragmentedCert[0];
    var adminSignature = fragmentedCert[1];
    isVerified = verifyACAP(encodedAPData, adminSignature);
    console.log(encodedAPData);
  } else if (fragmentedCert.length === 4) {
    encodedAPData = fragmentedCert[0];
    var PUsignature = fragmentedCert[1];
    var encodedPUData = fragmentedCert[2];
    var adminSignature = fragmentedCert[3];
    isVerified = verifyPUAP(
      encodedAPData,
      PUsignature,
      encodedPUData,
      adminSignature
    );
  }
  console.log("isVerified " + isVerified);
  var decodedData = base64toJson(data);
  var decodedAPData = base64toJson(encodedAPData);
  //Assume certificates have apId and apPub fields
  return isVerified && decodedData.apReg == decodedAPData.apId
    ? decodedAPData.apPub
    : -1;
}

export function verifyToken(token) {
  var fragmentedToken = token.split(".");
  //Mt identity
  var encodedData = fragmentedToken[0];
  console.log("encodedData " + encodedData);
  var signature = fragmentedToken[1];
  var cert = fragmentedToken.slice(2).join(".");
  var APPubKey = verifyAPReg(encodedData, cert);
  if (APPubKey != -1) {
    console.log("verified APREG");
    return verify(
      JSON.stringify(base64toJson(encodedData)),
      signature,
      Buffer.from(APPubKey)
    );
  }
  return false;
}
