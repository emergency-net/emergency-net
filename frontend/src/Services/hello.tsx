import { getApiURL } from "@/Library/getApiURL";
import axios from "axios";

export async function hello() {
  const response = await axios.get(getApiURL() + "/hello");
  return response;
}
