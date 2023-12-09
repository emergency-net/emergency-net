import { importPublicKeyPem, jwkToKey } from "./crypt";
import { base64ToArrayBuffer, base64ToJson, stringToArrayBuffer } from "./util";

const subtleCrypto = window.crypto.subtle;

export async function verifyApCert(cert: string, adminJwk: JsonWebKey) {
  const splitCert = cert.split(".");
  const adminKey = await jwkToKey(adminJwk);

  const content = base64ToJson(splitCert[0]);
  const signature = splitCert[1];

  if (signature === "NO_CERT") {
    return {
      apPublicKey: await importPublicKeyPem(content.apPub),
      apId: content.apId as string,
      apType: "lonely",
    };
  }

  const stringContent = JSON.stringify(content);

  const verified = await subtleCrypto.verify(
    { name: "RSA-PSS", saltLength: 0 },
    adminKey,
    base64ToArrayBuffer(signature),
    stringToArrayBuffer(stringContent)
  );

  if (verified) {
    return {
      apPublicKey: await importPublicKeyPem(content.apPub),
      apId: content.apId as string,
      apType: "infrastructure",
    };
  } else {
    throw new Error("Certificate Invalid");
  }
}
