import { sync } from "@/Services/sync";
import { useQuery, useQueryClient } from "react-query";

function useSyncStore() {
  const queryClient = useQueryClient();
  const { data: store, isLoading } = useQuery(["store"], sync);

  function initSync() {
    queryClient.invalidateQueries(["store"]);
  }
  return { store, isLoading, sync: initSync };
}

export default useSyncStore;
