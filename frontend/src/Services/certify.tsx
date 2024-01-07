import { keyToJwk } from "@/Library/crypt";
import { getApiURL } from "@/Library/getApiURL";
import { MTResponseSigner } from "@/Library/interceptors";
import { readAdminKey } from "@/Library/keys";
import axios from "axios";

export async function requestToCertify() {
  const content = {
    adminPubKey: await keyToJwk(await readAdminKey()),
  };

  const response = await axios.post(
    getApiURL() + "/request-to-certify",
    await MTResponseSigner(content)
  );

  return response.data;
}

export async function certify({ signature }: { signature: string }) {
  const content = {
    signedApContent: signature,
  };

  const response = await axios.post(
    getApiURL() + "/certify",
    await MTResponseSigner(content)
  );

  return response.data;
}
