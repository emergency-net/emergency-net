import { combineMessages, removeMessages } from "@/Library/sync";
import { sync } from "@/Services/sync";
import { useQuery, useQueryClient } from "react-query";
import { getCookie } from "typescript-cookie";

interface Store {
  messages: Record<string, Record<string, any>>;
  channels: any;
}

function useSyncStore(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const tokenExists = !!getCookie("token");

  const { data: syncStore, isLoading: isSyncLoading } = useQuery<Store>(
    ["store"],
    async () => {
      let storeString = localStorage.getItem("store");
      if (!storeString) {
        storeString = JSON.stringify({ messages: {}, channels: [] });
        localStorage.setItem("store", storeString);
      }

      const localStore: Store = JSON.parse(storeString);

      const response = await sync({
        localStore,
      });

      const { missingMessages, unverifiedMessages, channels } =
        response.content;

      const sterileMessages = removeMessages(
        localStore.messages,
        unverifiedMessages
      );
      const updatedMessages = combineMessages(sterileMessages, missingMessages);

      let cleanedMessages: any = {};

      Object.keys(updatedMessages).forEach((key) => {
        if (channels.find((c: any) => c.channelName === key)?.isActive) {
          cleanedMessages[key] = updatedMessages[key];
        }
      });

      const newStore = { channels, messages: cleanedMessages };
      localStorage.setItem("store", JSON.stringify(newStore));

      return newStore;
    },
    {
      enabled: tokenExists,
      onSuccess,
    }
  );
  function initSync() {
    queryClient.invalidateQueries(["store"]);
  }

  // useEffect(() => {
  //   if (syncStore) {
  //     const channels = Object.values(syncStore);
  //     const messages = channels.flatMap((channel: any) =>
  //       Object.values(channel)
  //     );
  //     localStorage.setItem("store", JSON.stringify(messages));
  //   }
  // }, [syncStore]);

  return {
    store: syncStore,
    sync: initSync,
    isLoading: isSyncLoading,
  };
}

export default useSyncStore;
