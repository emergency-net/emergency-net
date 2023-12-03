import axios from "axios";

export async function register({
  username,
}: {
  username: string;
  key: CryptoKey;
}) {
  const response = await axios.post(
    import.meta.env.VITE_API_URL + "/register",
    {
      username,
    }
  );

  return response.data;
}
