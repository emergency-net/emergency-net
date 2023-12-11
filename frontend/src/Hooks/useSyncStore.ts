import { sync } from "@/Services/sync";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";
import { getCookie } from "typescript-cookie";

function useSyncStore() {
  const queryClient = useQueryClient();
  const tokenExists = !!getCookie("token");

  const { data: syncStore, isLoading: isSyncLoading } = useQuery(
    ["store", "sync"],
    () => sync().then((res) => res.content.messages),
    {
      enabled: tokenExists,
    }
  );
  function initSync() {
    queryClient.invalidateQueries(["store", "sync"]);
  }
  const { data: localStore, isLoading: isLocalLoading } = useQuery(
    ["store", "sync"],
    () => {
      let storeString = localStorage.getItem("store");
      if (!storeString) {
        localStorage.setItem("store", "[]");
        storeString = "[]";
      }

      return JSON.parse(storeString);
    }
  );

  useEffect(() => {
    if (syncStore) {
      localStorage.setItem("store", JSON.stringify(syncStore));
      queryClient.invalidateQueries(["store", "store"]);
    }
  }, [syncStore]);

  return {
    store: localStore,
    sync: initSync,
    isLoading: isLocalLoading || isSyncLoading,
  };
}

export default useSyncStore;
