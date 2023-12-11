import { base64ToJson } from "./util";

export function getTokenData(token: string) {
  const encodedData = token.split(".")[0];
  const decodedData = base64ToJson(encodedData);
  return decodedData;
}
