import { getApiURL } from "@/Library/getApiURL";
import { MTResponseSigner } from "@/Library/interceptors";
import { readAdminKey } from "@/Library/keys";
import axios from "axios";

export async function requestToCertify() {
  const content = {
    adminPubKey: await readAdminKey(),
  };

  const response = await axios.post(
    getApiURL() + "/message",
    await MTResponseSigner(content)
  );

  return response.data;
}

export async function certify({ signature }: { signature: string }) {
  const content = {
    signedApContent: await readAdminKey(),
  };

  const response = await axios.post(
    getApiURL() + "/message",
    await MTResponseSigner(content)
  );

  return response.data;
}
