import { keyToJwk } from "@/Library/crypt";
import { getApiURL } from "@/Library/getApiURL";
import axios from "axios";

export async function register({
  key,
  username,
  password,
}: {
  username: string;
  key: CryptoKey;
  password?: string;
}) {
  const jwk = await keyToJwk(key);
  const response = await axios.post(getApiURL() + "/register", {
    username,
    mtPubKey: jwk,
    password,
  });

  return response.data;
}
