import { Channel } from "../database/entity/Channel.js";
import { Message } from "../database/entity/Message.js";
import { AppDataSource } from "../database/newDbSetup.js";
import { base64toJson, verify, verifyACAP, verifyPUAP } from "./CryptoUtil.js";

export function verifyMessage(message) {
  const certificate = message.certificate;
  const fragmentedCert = certificate.split(".");
  const signature = fragmentedCert[0];
  const apCert = fragmentedCert.slice(1).join(".");
  const verificationResult = verifyAPSource(apCert);
  let apPubKey;
  let isSafe = true;
  if (verificationResult?.apPubKey) {
    apPubKey = verificationResult.apPubKey;
    if (verificationResult.reason === "No certificate") {
      isSafe = false;
    }
    const messageToCheck = {
      content: message.content,
      tod: message.tod,
      usernick: message.usernick,
      origin: message.origin,
    };
    const isVerified = verify(
      JSON.stringify(messageToCheck),
      signature,
      apPubKey
    );
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

export function verifyChannel(channel) {
  const certificate = channel.channelCert;
  const fragmentedCert = certificate.split(".");
  const signature = fragmentedCert[0];
  const apCert = fragmentedCert.slice(1).join(".");
  const verificationResult = verifyAPSource(apCert);
  let apPubKey;
  let isSafe = true;
  if (verificationResult?.apPubKey) {
    apPubKey = verificationResult.apPubKey;
    if (verificationResult.reason === "No certificate") {
      return {
        isSafe: false,
        isChannelVerified: false,
      };
    }
    const channelInfo = {
      channelName: channel.channelName,
      isActive: channel.isActive,
      tod: channel.tod,
    };
    const isVerified = verify(JSON.stringify(channelInfo), signature, apPubKey);
    return {
      isChannelVerified: isVerified,
      isSafe: isSafe,
    };
  } else {
    return {
      isChannelVerified: false,
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

export async function getChannelsToSend() {
  return await AppDataSource.getRepository(Channel).find();
}

export async function getMessagesToSend(receivedMessages) {
  const channelMap = {};

  const channels = await AppDataSource.getRepository(Channel).find({
    where: {
      isActive: true,
    },
  });
  await Promise.all(
    channels.map(async (channel) => {
      const channelName = channel.channelName;
      try {
        const result = await AppDataSource.manager.find(Message, {
          where: { channel: channelName },
        });

        const messageMap = {};

        result.forEach((row) => {
          if (
            receivedMessages[channelName] === undefined ||
            !Object.keys(receivedMessages[channelName]).includes(row.hashKey)
          ) {
            const hashkey = row.hashKey;
            const message = row;

            messageMap[hashkey] = message;
          }
        });

        channelMap[channelName] = messageMap;
      } catch (error) {
        console.error(
          `Error fetching messages for channel ${channelName}:`,
          error
        );
      }
    })
  );
  return channelMap;
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

export async function findMissingChannels(receivedChannels) {
  const missingChannels = [];
  await Promise.all(
    receivedChannels.map(async (channel) => {
      try {
        const result = await AppDataSource.manager.findOneBy(Channel, {
          channelName: channel.channelName,
        });
        if (!result) {
          missingChannels.push(channel);
        } else if (result.tod < channel.tod) {
          missingChannels.push(channel);
        }
      } catch (error) {
        console.log("Error while finding channel");
        throw error;
      }
    })
  );
  return missingChannels;
}
