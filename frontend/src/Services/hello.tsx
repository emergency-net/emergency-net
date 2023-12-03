import axios from "axios";

export async function hello() {
  const response = await axios.get(import.meta.env.VITE_API_URL + "/hello");
  return response;
}
