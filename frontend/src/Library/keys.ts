import { generateKeys } from "./crypt";

export async function initKeys() {
  const { sign, encrypt } = await generateKeys();

  const keys = [
    {
      name: "encryptPrivateKey",
      key: encrypt.privateKey,
    },
    {
      name: "encryptPublicKey",
      key: encrypt.publicKey,
    },
    {
      name: "signPrivateKey",
      key: sign.privateKey,
    },
    {
      name: "signPublicKey",
      key: sign.publicKey,
    },
  ];

  await Promise.all(
    keys.map(async (key) => {
      const jwk = await window.crypto.subtle.exportKey("jwk", key.key);
      window.localStorage.setItem(key.name, JSON.stringify(jwk));
    })
  );

  console.log("KEYS INITIALIZED");
}
