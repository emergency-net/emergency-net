import { MTResponseSigner } from "@/Library/interceptors";
import axios from "axios";

export async function message({
  msgContent,
  channel,
}: {
  msgContent: string;
  channel: string;
}) {
  const content = {
    message: {
      channel,
      tod: Date.now(),
      content: msgContent,
      usernick: "test",
    },
    tod: Date.now(),
    priority: 1,
    type: "MT_MSG",
  };

  const response = await axios.post(
    import.meta.env.VITE_API_URL + "/message",
    await MTResponseSigner(content)
  );

  return response.data;
}
