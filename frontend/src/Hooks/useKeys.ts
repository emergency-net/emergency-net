import { jwkToKey } from "../Library/crypt";
import { initKeys } from "../Library/keys";
import { useQuery, useQueryClient } from "react-query";

function useKeys() {
  const queryClient = useQueryClient();
  const { data: keys, isLoading: keysLoading } = useQuery(
    ["keys"],
    async () => {
      if (!localStorage.getItem("privateKey")) await initKeys();

      // const encryptPrivateKey = await jwkToKey(
      //   JSON.parse(localStorage.getItem("encryptPrivateKey")!) as JsonWebKey,
      //   "encrypt"
      // );
      // const encryptPublicKey = await jwkToKey(
      //   JSON.parse(localStorage.getItem("encryptPublicKey")!) as JsonWebKey,
      //   "encrypt"
      // );
      const privateKey = await jwkToKey(
        JSON.parse(localStorage.getItem("privateKey")!) as JsonWebKey
      );
      const publicKey = await jwkToKey(
        JSON.parse(localStorage.getItem("publicKey")!) as JsonWebKey
      );

      return {
        MTprivate: privateKey,
        MTpublic: publicKey,
      };
    }
  );

  const { data: adminKey, isLoading: adminKeyLoading } = useQuery(
    ["adminKey"],
    async () => {
      const adminKeyString = localStorage.getItem("adminKey");

      if (adminKeyString) {
        return await jwkToKey(
          JSON.parse(localStorage.getItem("adminKey")!) as JsonWebKey
        );
      }
    }
  );

  async function setAdminKey(key: JsonWebKey) {
    localStorage.setItem("adminKey", JSON.stringify(key));
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
