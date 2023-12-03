import { jwkToKey } from "../Library/crypt";
import { initKeys } from "../Library/keys";
import { useQuery } from "react-query";

function useKeys() {
  const { data: keys, isLoading: keysLoading } = useQuery(
    ["myKeys"],
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
      const signPrivateKey = await jwkToKey(
        JSON.parse(localStorage.getItem("privateKey")!) as JsonWebKey,
        "sign"
      );
      const signPublicKey = await jwkToKey(
        JSON.parse(localStorage.getItem("publicKey")!) as JsonWebKey,
        "sign"
      );

      return {
        MTprivate: signPrivateKey,
        MTpublic: signPublicKey,
      };
    }
  );

  return {
    ...keys,
    keysLoading,
  };
}

export default useKeys;
