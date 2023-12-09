import { base64toJson, verify, verifyACAP, verifyPUAP } from "./CryptoUtil.js";

export function verifyAPReg(data, cert) {
  let isVerified = false;
  const fragmentedCert = cert.split(".");

  let encodedAPData;
  const decodedData = base64toJson(data);
  if (fragmentedCert.length === 2) {
    //Admin certified AP
    encodedAPData = fragmentedCert[0];
    let adminSignature = fragmentedCert[1];
    if (adminSignature === "NO_CERT") {
      const decodedAPData = base64toJson(encodedAPData);
      //THINK: Can't anyone change this?
      if (decodedAPData.apId === decodedData.apReg) {
        return {
          isApVerified: false,
          apPubKey: decodedAPData.apPub,
          reason: "No certificate",
        };
      }
    } else {
      isVerified = verifyACAP(encodedAPData, adminSignature);
      //console.log(encodedAPData);
    }
  } else if (fragmentedCert.length === 4) {
    //PU certified AP
    encodedAPData = fragmentedCert[0];
    const PUsignature = fragmentedCert[1];
    const encodedPUData = fragmentedCert[2];
    const adminSignature = fragmentedCert[3];
    isVerified = verifyPUAP(
      encodedAPData,
      PUsignature,
      encodedPUData,
      adminSignature
    );
  } else {
    return {
      isApVerified: false,
      reason: "Certificate is not in the correct format",
    };
  }
  //console.log("isVerified " + isVerified);

  var decodedAPData = base64toJson(encodedAPData);

  //Assume certificates have apId and apPub fields
  if (decodedData.apReg !== decodedAPData.apId) {
    return {
      isApVerified: false,
      reason: "Registered AP id does not match",
    };
  } else if (!isVerified) {
    return {
      isApVerified: false,
      reason: "Certificate is not valid",
    };
  }
  return { isApVerified: true, apPubKey: decodedAPData.apPub };
}

export function verifyToken(token) {
  //Token is in the form of payload.signature.certificate
  const fragmentedToken = token.split(".");
  if (fragmentedToken.length < 3) {
    return {
      isApVerified: false,
      isTokenVerified: false,
      reason: "Token is not in the correct format",
    };
  }
  //Mt identity is the first part of the token, base64 encoded
  const encodedData = fragmentedToken[0];
  //console.log("encodedData " + encodedData);
  //Signature is the second part of the token
  const signature = fragmentedToken[1];
  //Certificate is the third part of the token
  const cert = fragmentedToken.slice(2).join(".");
  const verificationResult = verifyAPReg(encodedData, cert);
  if (verificationResult.isApVerified === true) {
    //console.log("verified APREG");
    let isTokenVerified = verify(
      JSON.stringify(base64toJson(encodedData)),
      signature,
      Buffer.from(verificationResult.apPubKey)
    );
    return {
      isApVerified: true,
      isTokenVerified: isTokenVerified,
    };
  } //This is the case where the AP has no certificate but correct format
  else if (
    verificationResult.isApVerified === false &&
    verificationResult.reason === "No certificate"
  ) {
    let isTokenVerified = verify(
      JSON.stringify(base64toJson(encodedData)),
      signature,
      Buffer.from(verificationResult.apPubKey)
    );
    return {
      isApVerified: false,
      isTokenVerified: isTokenVerified,
    };
  }
  return {
    isApVerified: false,
    isTokenVerified: false,
    reason: verificationResult.reason,
  };
}
