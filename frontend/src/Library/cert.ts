import { APData } from "./APData";
import { importPublicKeyPem, verify } from "./crypt";
import { readAdminKey } from "./keys";
import { base64ToJson } from "./util";

export async function verifyApCert(cert: string): Promise<APData> {
  let adminKey;
  try {
    adminKey = await readAdminKey();
  } catch (err) {}

  const splitCert = cert.split(".");

  const APcontent = base64ToJson(splitCert[0]);
  const APsignature = splitCert[1];

  if (!adminKey) {
    return {
      key: await importPublicKeyPem(APcontent.apPub),
      id: APcontent.apId as string,
      type: "unknown",
    };
  }
  if (splitCert.length === 2) {
    if (APsignature === "NO_CERT") {
      return {
        key: await importPublicKeyPem(APcontent.apPub),
        id: APcontent.apId as string,
        type: "non_certified",
      };
    }

    const stringContent = JSON.stringify(APcontent);

    const verified = await verify(adminKey, APsignature, stringContent);
    if (verified) {
      return {
        key: await importPublicKeyPem(APcontent.apPub),
        id: APcontent.apId as string,
        type: "admin_certified",
      };
    } else {
      throw new Error("AP Certificate Invalid");
    }
  } else if (splitCert.length === 4) {
    const PUcontent = base64ToJson(splitCert[2]);
    const PUsignature = splitCert[3];
    const stringPUContent = JSON.stringify(PUcontent);
    const PUverified = await verify(adminKey, PUsignature, stringPUContent);
    if (!PUverified) {
      throw new Error("PU Certificate in AP Certificate invalid.");
    }

    const stringAPContent = JSON.stringify(APcontent);

    const verified = await verify(adminKey, APsignature, stringAPContent);
    if (verified) {
      return {
        key: await importPublicKeyPem(APcontent.apPub),
        id: APcontent.apId as string,
        type: "pu_certified",
      };
    } else {
      throw new Error("PU AP Certificate Invalid");
    }
  } else {
    throw new Error("AP Certificate Weird");
  }
}

export async function giveApproval(cert: string) {
  const splitCert = cert;
}
