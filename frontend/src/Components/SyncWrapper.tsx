import { Outlet } from "react-router-dom";
import SyncButton from "./SyncButton";
import useSyncStore from "@/Hooks/useSyncStore";

function SyncWrapper() {
  const { sync, isLoading } = useSyncStore();
  return (
    <>
      <SyncButton
        className="absolute top-0 right-8"
        onClick={sync}
        isLoading={isLoading}
      />
      <Outlet />
    </>
  );
}

export default SyncWrapper;
