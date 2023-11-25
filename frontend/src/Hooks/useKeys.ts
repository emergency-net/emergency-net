import { jwkToKey } from "../Library/crypt";
import { initKeys } from "../Library/keys";
import { useQuery } from "react-query";

function useKeys() {
  const { data: keys, isLoading: keysLoading } = useQuery(
    ["myKeys"],
    async () => {
      if (!localStorage.getItem("encryptPrivateKey")) await initKeys();

      const encryptPrivateKey = await jwkToKey(
        JSON.parse(localStorage.getItem("encryptPrivateKey")!) as JsonWebKey,
        "encrypt"
      );
      const encryptPublicKey = await jwkToKey(
        JSON.parse(localStorage.getItem("encryptPublicKey")!) as JsonWebKey,
        "encrypt"
      );
      const signPrivateKey = await jwkToKey(
        JSON.parse(localStorage.getItem("signPrivateKey")!) as JsonWebKey,
        "sign"
      );
      const signPublicKey = await jwkToKey(
        JSON.parse(localStorage.getItem("signPublicKey")!) as JsonWebKey,
        "sign"
      );

      return {
        encryptKeys: {
          private: encryptPrivateKey,
          public: encryptPublicKey,
        },
        signKeys: {
          private: signPrivateKey,
          public: signPublicKey,
        },
      };
    }
  );

  return {
    ...keys,
    keysLoading,
  };
}

export default useKeys;
