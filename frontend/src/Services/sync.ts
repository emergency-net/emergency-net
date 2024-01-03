import { getApiURL } from "@/Library/getApiURL";
import { APResponseVerifier, MTResponseSigner } from "@/Library/interceptors";
import axios from "axios";

export async function sync({ localStore }: { localStore: any }) {
  const response = await axios.post(
    getApiURL() + "/sync",
    await MTResponseSigner(localStore ?? {})
  );
  return await APResponseVerifier(response.data);
}
