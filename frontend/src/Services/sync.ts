import { APResponseVerifier, MTResponseSigner } from "@/Library/interceptors";
import axios from "axios";
import { message } from "./message";

export async function sync({ localStore }: { localStore: any }) {
  const response = await axios.post(
    import.meta.env.VITE_API_URL + "/sync",
    await MTResponseSigner({
      tod: Date.now(),
      messages: localStore ?? {},
    })
  );
  return await APResponseVerifier(response.data);
}
