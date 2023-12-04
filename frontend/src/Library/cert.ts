import { importPublicKeyPem, jwkToKey } from "./crypt";
import { base64ToJson } from "./util";

const subtleCrypto = window.crypto.subtle;

export async function verifyApCert(cert: string, adminJwk: JsonWebKey) {
  const splitCert = cert.split(".");
  const adminKey = await jwkToKey(adminJwk);

  const content = base64ToJson(splitCert[0]);

  console.log(content);

  const apPubKey = await importPublicKeyPem(content.apPub);

  console.log(apPubKey);
}
