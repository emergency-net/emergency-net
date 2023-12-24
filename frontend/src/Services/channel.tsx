import { getApiURL } from "@/Library/getApiURL";
import { MTResponseSigner } from "@/Library/interceptors";
import axios from "axios";

export async function createChannel(channelName: string) {
  const response = await axios.post(
    getApiURL() + "/channel",
    await MTResponseSigner({ channelName })
  );

  return response.data;
}
