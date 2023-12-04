import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { cn } from "@/Library/cn";
import clsx from "clsx";
import { ArrowLeftCircle, MessagesSquare, SendHorizonal } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

function Channel() {
  const { channelName } = useParams();
  const [keyboardFocused, setKeyboardFocused] = useState(false);

  return (
    <div className="grid grid-rows-[60px_1fr_60px] h-screen">
      <div className="border-b border-gray-200 flex items-center  bg-white text-lg">
        <Link
          className="h-full aspect-square flex items-center justify-center transition-transform duration-100 active:scale-95"
          to={"/home"}
        >
          <ArrowLeftCircle size={35} className="text-gray-400" />
        </Link>
        <div className="flex gap-2 items-center ml-2">
          <MessagesSquare /> {channelName}
        </div>
      </div>

      <div className=" shadow-inner flex flex-col justify-end">
        Mesajlar burada olacak
      </div>
      <div
        className={cn(
          "border-t border-gray-200 bg-white ",
          keyboardFocused && "static"
        )}
      >
        <form className="flex items-stretch justify-stretch h-full w-full gap-2 p-2 ">
          <Input
            className={"flex-1 h-full border-2"}
            onFocus={() => setKeyboardFocused(true)}
            onBlur={() => setKeyboardFocused(false)}
          />
          <Button
            type="submit"
            className=" h-full  aspect-square p-0 transition-transform duration-100 active:scale-95"
          >
            <SendHorizonal />
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Channel;
