import { getApiURL } from "@/Library/getApiURL";
import { APResponseVerifier } from "@/Library/interceptors";
import axios from "axios";

export async function getPassword() {
  const response = await axios.get(getApiURL() + "/get-password");
  return await APResponseVerifier(response.data);
}
