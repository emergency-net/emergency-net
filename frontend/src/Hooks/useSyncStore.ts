import { sync } from "@/Services/sync";
import { useQuery, useQueryClient } from "react-query";
import { getCookie } from "typescript-cookie";

function useSyncStore() {
  const queryClient = useQueryClient();
  const tokenExists = !!getCookie("token");
  const { data: store, isLoading } = useQuery(["store"], sync, {
    enabled: tokenExists,
  });

  function initSync() {
    queryClient.invalidateQueries(["store"]);
  }
  return { store, isLoading, sync: initSync };
}

export default useSyncStore;
