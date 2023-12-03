import { keyToJwk } from "@/Library/crypt";
import axios from "axios";

export async function register({
  key,
  username,
}: {
  username: string;
  key: CryptoKey;
}) {
  const jwk = await keyToJwk(key);
  const response = await axios.post(
    import.meta.env.VITE_API_URL + "/register",
    {
      username,
      mtPubKey: jwk,
    }
  );

  return response.data;
}
