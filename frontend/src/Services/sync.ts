import { APResponseVerifier, MTResponseSigner } from "@/Library/interceptors";
import axios from "axios";
import { message } from "./message";

export async function sync() {
  const response = await axios.post(
    import.meta.env.VITE_API_URL + "/sync",
    await MTResponseSigner({
      tod: Date.now(),
      messages: [],
    })
  );
  return await APResponseVerifier(response.data);
}
