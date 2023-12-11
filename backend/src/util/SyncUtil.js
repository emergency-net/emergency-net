import { Message } from "../database/entity/Message.js";
import { AppDataSource } from "../database/newDbSetup.js";
import { base64toJson, verify, verifyACAP, verifyPUAP } from "./CryptoUtil.js";

export function verifyMessage(message) {
  const certificate = message.certificate;
  const signature = certificate.split(".")[0];
  const apCert = certificate.split(".")[1];
  const verificationResult = verifyAPSource(apCert);
  let apPubKey;
  let isSafe = true;
  if (verificationResult?.apPubKey) {
    apPubKey = verificationResult.apPubKey;
    if (verificationResult.reason === "No certificate") {
      isSafe = false;
    }
    const isVerified = verify(JSON.stringify(message), signature, apPubKey);
    return {
      isMessageVerified: isVerified,
      isSafe: isSafe,
    };
  } else {
    return {
      isMessageVerified: false,
    };
  }
}

export function verifyAPSource(certificate) {
  let isVerified = false;
  const fragmentedCert = certificate.split(".");
  let encodedAPData;
  if (fragmentedCert.length === 2) {
    //Admin certified AP
    encodedAPData = fragmentedCert[0];
    let adminSignature = fragmentedCert[1];
    if (adminSignature === "NO_CERT") {
      const decodedAPData = base64toJson(encodedAPData);
      return {
        isApVerified: false,
        apPubKey: decodedAPData.apPub,
        reason: "No certificate",
      };
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
  let decodedAPData = base64toJson(encodedAPData);
  if (!isVerified) {
    return {
      isApVerified: isVerified,
      reason: "Certificate is not valid",
    };
  }
  return { isApVerified: isVerified, apPubKey: decodedAPData.apPub };
}

export function messagesToMap() {
  /*return AppDataSource.manager.find(Message).then((allMessages) => {
    const messageMap = new Map();

    allMessages.map((message) => messageMap.set(message.hashKey, message));
    return messageMap;

  });*/
  return AppDataSource.manager
    .createQueryBuilder(Message, "message")
    .select("*") // Use array_agg to aggregate hashKeys into an array
    .from(Message, "message")
    .groupBy("channel")
    .getRawMany()
    .then((result) => {
      const messageMapByChannel = {};
      console.log("result", result);
      return messageMapByChannel;
    });
}

/*export function findMissingMessages(receivedMessages, messageMap) {
  const missingMessages = [];
  receivedMessages.forEach((message) => {
    if (!messageMap.has(message.hashKey)) {
      missingMessages.push(message);
    }
  });
  return missingMessages;
}*/

export async function findMissingMessages(receivedMessages) {
  const missingMessages = [];

  await receivedMessages.forEach(async (message) => {
    try {
      const result = await AppDataSource.manager.findOneBy(Message, {
        hashKey: message.hashKey,
      });
      if (!result) {
        missingMessages.push(message);
      }
    } catch (error) {
      console.log("Error while finding message");
      throw error;
    }
  });
  return missingMessages;
}
