import { cn } from "@/Library/cn";
import { CheckCircle2, RefreshCcw } from "lucide-react";

function SyncButton({
  className,
  onClick,
  isLoading,
  tick = false,
}: {
  className?: string;
  onClick?: () => void;
  isLoading?: boolean;
  tick?: boolean;
}) {
  return (
    <div
      className={cn(
        "dark:bg-gray-800 bg-gray-400 p-2 rounded-br-lg group rounded-bl-lg shadow-xl z-50 border dark:border-gray-600 border-gray-300 border-t-0 dark:text-gray-400 text-white relative",
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

      <div
        className={cn(
          "absolute bg-inherit inset-1 flex justify-center items-center text-green-500",
          "transition-opacity duration-500 opacity-0",
          tick && "duration-0 opacity-100"
        )}
      >
        <CheckCircle2 size={36} />
      </div>
    </div>
  );
}

export default SyncButton;
