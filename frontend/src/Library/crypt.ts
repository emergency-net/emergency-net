import { arrayBufferToBase64, base64ToArrayBuffer } from "./util";

const subtleCrypto = window.crypto.subtle;

const encryptAlgorithm = {
  name: "RSA-OAEP",
  modulusLength: 2048,
  publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
  hash: "SHA-256",
} as any;

export const signAlgorithm = {
  name: "RSA-PSS",
  modulusLength: 2048,
  publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
  hash: "SHA-256",
  saltLength: 0,
} as any;

function pemToArrayBuffer(pem: string) {
  const b64Lines = pem
    .replace(/-----[A-Z ]+-----/g, "")
    .replace(/\n/g, "")
    .replace(/\r/g, "");
  const binaryString = window.atob(b64Lines);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function importPublicKeyPem(pem: string) {
  const arrayBuffer = pemToArrayBuffer(pem);

  try {
    const key = await window.crypto.subtle.importKey(
      "spki", // for public key
      arrayBuffer,
      {
        name: "RSA-PSS", // or another algorithm
        hash: "SHA-256", // hash used with your key
      },
      true, // whether the key is extractable
      ["verify"] // the use of your key, e.g., 'encrypt'
    );

    return key;
  } catch (e) {
    console.error("Import failed:", e);
    throw e;
  }
}

export async function generateKeys() {
  const encryptKeypair = await subtleCrypto.generateKey(
    encryptAlgorithm,
    true,
    ["encrypt", "decrypt"]
  );
  const signKeypair = await subtleCrypto.generateKey(signAlgorithm, true, [
    "sign",
    "verify",
  ]);

  return { encrypt: encryptKeypair, sign: signKeypair };
}

export async function jwkToKey(
  key: JsonWebKey,
  type: "encrypt" | "sign" = "sign"
) {
  const keyUsages = key.key_ops;
  const alg = type === "encrypt" ? encryptAlgorithm : signAlgorithm;

  // @ts-ignore
  return await subtleCrypto.importKey("jwk", key, alg, true, keyUsages);
}

export async function keyToJwk(key: CryptoKey): Promise<JsonWebKey> {
  // Export the key to the JWK format
  const jwk = await crypto.subtle.exportKey("jwk", key);
  return jwk;
}

export async function encrypt(key: CryptoKey, msg: string) {
  const encoded = new TextEncoder().encode(msg);

  const encrypted = await subtleCrypto.encrypt(encryptAlgorithm, key, encoded);

  return arrayBufferToBase64(encrypted);
}

export async function decrypt(key: CryptoKey, encrypted: string) {
  const encoded = base64ToArrayBuffer(encrypted);

  const decrypted = await subtleCrypto.decrypt(encryptAlgorithm, key, encoded);

  const decoder = new TextDecoder();
  return await decoder.decode(decrypted);
}

export async function sign(key: CryptoKey, msg: string) {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(msg);

  const signature = await subtleCrypto.sign(signAlgorithm, key, encoded);

  return arrayBufferToBase64(signature);
}

export async function verify(key: CryptoKey, signature: string, msg: string) {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(msg);

  const decodedSignature = base64ToArrayBuffer(signature);

  return await subtleCrypto.verify(
    signAlgorithm,
    key,
    decodedSignature,
    encoded
  );
}

// export async function exportKey(key: CryptoKey) {
//   const exported = await subtleCrypto.exportKey("spki", key);
//   const base64 = await arrayBufferToBase64(exported);
//   return base64;
// }
