import axios from "axios";

export async function register(body: { username: string; key: CryptoKey }) {
  const response = await axios.post(
    import.meta.env.VITE_API_URL + "/register",
    body
  );

  return response.data;
}
