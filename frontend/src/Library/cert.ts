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

  const content = base64ToJson(splitCert[0]);
  if (!adminKey) {
    return {
      key: await importPublicKeyPem(content.apPub),
      id: content.apId as string,
      type: "unknown",
    };
  }
  const signature = splitCert[1];

  if (signature === "NO_CERT") {
    return {
      key: await importPublicKeyPem(content.apPub),
      id: content.apId as string,
      type: "non_certified",
    };
  }

  const stringContent = JSON.stringify(content);

  const verified = await verify(adminKey, signature, stringContent);
  if (verified) {
    return {
      key: await importPublicKeyPem(content.apPub),
      id: content.apId as string,
      type: "admin_certified",
    };
  } else {
    throw new Error("AP Certificate Invalid");
  }
}
