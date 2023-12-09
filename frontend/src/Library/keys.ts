import { generateKeys, jwkToKey } from "./crypt";

export async function initKeys() {
  const { sign, encrypt } = await generateKeys();

  const keys = [
    // {
    //   name: "encryptPrivateKey",
    //   key: encrypt.privateKey,
    // },
    // {
    //   name: "encryptPublicKey",
    //   key: encrypt.publicKey,
    // },
    {
      name: "privateKey",
      key: sign.privateKey,
    },
    {
      name: "publicKey",
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

export async function readPrivateKey() {
  if (!localStorage.getItem("privateKey")) {
    await initKeys();
  }

  const privateKey = await jwkToKey(
    JSON.parse(localStorage.getItem("privateKey")!) as JsonWebKey
  );

  return privateKey;
}

export async function readPublicKey() {
  if (!localStorage.getItem("publicKey")) {
    await initKeys();
  }

  const publicKey = await jwkToKey(
    JSON.parse(localStorage.getItem("publicKey")!) as JsonWebKey
  );

  return publicKey;
}

export async function readAdminKey() {
  const adminKeyString = localStorage.getItem("adminKey");
  if (adminKeyString) {
    return await jwkToKey(
      JSON.parse(localStorage.getItem("adminKey")!) as JsonWebKey
    );
  } else {
    throw new Error("Admin key does not exist");
  }
}
