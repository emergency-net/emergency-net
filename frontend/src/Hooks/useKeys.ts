import { keyToJwk } from "../Library/crypt";
import { readAdminKey, readPrivateKey, readPublicKey } from "../Library/keys";
import { useQuery, useQueryClient } from "react-query";

function useKeys() {
  const queryClient = useQueryClient();
  const { data: keys, isLoading: keysLoading } = useQuery(
    ["keys"],
    async () => {
      const privateKey = await readPrivateKey();
      const publicKey = await readPublicKey();

      return {
        MTprivate: privateKey,
        MTpublic: publicKey,
      };
    }
  );

  const { data: adminKey, isLoading: adminKeyLoading } = useQuery(
    ["adminKey"],
    async () => {
      return await readAdminKey();
    }
  );

  async function setAdminKey(key: CryptoKey) {
    localStorage.setItem("adminKey", JSON.stringify(await keyToJwk(key)));
    queryClient.invalidateQueries(["adminKey"]);
  }

  return {
    ...keys,
    adminKey,
    keysLoading: keysLoading || adminKeyLoading,
    setAdminKey,
  };
}

export default useKeys;
