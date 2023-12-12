import { Outlet } from "react-router-dom";
import SyncButton from "./SyncButton";
import useSyncStore from "@/Hooks/useSyncStore";
import { useState } from "react";

function SyncWrapper() {
  const [tick, setTick] = useState(false);
  const { sync, isLoading } = useSyncStore(() => {
    setTick(true);
    setTimeout(() => setTick(false), 100);
  });
  return (
    <>
      <SyncButton
        className="absolute top-0 right-8"
        onClick={sync}
        isLoading={isLoading}
        tick={tick}
      />
      <Outlet />
    </>
  );
}

export default SyncWrapper;
