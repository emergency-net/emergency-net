import { sync } from "@/Services/sync";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";
import { getCookie } from "typescript-cookie";

function useSyncStore() {
  const queryClient = useQueryClient();
  const tokenExists = !!getCookie("token");

  const { data: syncStore, isLoading: isSyncLoading } = useQuery(
    ["store"],
    () => {
      let storeString = localStorage.getItem("store");
      if (!storeString) {
        localStorage.setItem("store", "[]");
        storeString = "[]";
      }
      return sync({ localStore: JSON.parse(storeString) }).then(
        (res) => res.content.messages
      );
    },
    {
      enabled: tokenExists,
    }
  );
  function initSync() {
    queryClient.invalidateQueries(["store"]);
  }

  useEffect(() => {
    if (syncStore) {
      const channels = Object.values(syncStore);
      const messages = channels.flatMap((channel: any) =>
        Object.values(channel)
      );
      localStorage.setItem("store", JSON.stringify(messages));
      queryClient.invalidateQueries(["store"]);
    }
  }, [syncStore]);

  return {
    store: syncStore,
    sync: initSync,
    isLoading: isSyncLoading,
  };
}

export default useSyncStore;
