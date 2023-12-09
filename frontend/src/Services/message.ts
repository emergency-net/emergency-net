import { keyToJwk, sign, signByMT } from "@/Library/crypt";
import axios from "axios";

export async function message({
  message,
  channel,
}: {
  message: string;
  channel: string;
}) {
  const content = {
    content: message,
    channel,
    tod: Date.now(),
    usernick: `test123`,
  };

  const response = await axios.post(import.meta.env.VITE_API_URL + "/message", {
    content,
    signature: await signByMT(JSON.stringify(content)),
  });

  return response.data;
}
