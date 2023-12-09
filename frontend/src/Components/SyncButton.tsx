import { cn } from "@/Library/cn";
import { RefreshCcw } from "lucide-react";

function SyncButton({
  className,
  onClick,
  isLoading,
}: {
  className?: string;
  onClick?: () => void;
  isLoading?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-gray-400 p-2 rounded-br-lg group rounded-bl-lg shadow-xl z-50 border border-gray-300 border-t-0 text-white",
        className
      )}
      onClick={onClick}
    >
      <RefreshCcw
        size={36}
        className={cn(
          "transition-transform duration-100 group-active:scale-95",
          isLoading && "animate-spin"
        )}
      />
    </div>
  );
}

export default SyncButton;
