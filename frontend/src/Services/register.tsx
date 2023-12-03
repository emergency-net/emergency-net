import { exportKey } from "@/Library/crypt";
import axios from "axios";

export async function register({
  key,
  username,
}: {
  username: string;
  key: CryptoKey;
}) {
  const exportedKey = exportKey(key);
  const response = await axios.post(
    import.meta.env.VITE_API_URL + "/register",
    {
      mtPubKey: exportedKey,
      username,
    }
  );

  return response.data;
}
