import { keyToJwk } from "@/Library/crypt";
import axios from "axios";

export async function message({
  key,
  message,
}: {
  message: string;
  key: CryptoKey;
}) {
  const jwk = await keyToJwk(key);

  const response = await axios.post(import.meta.env.VITE_API_URL + "/message", {
    message,
    mtPubKey: jwk,
    tod: Date.now(),
    usernick: `test123`,
  });

  return response.data;
}
