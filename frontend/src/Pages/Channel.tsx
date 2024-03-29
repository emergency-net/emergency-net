import { useTokenData } from "@/Components/HelloWrapper";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import useSyncStore from "@/Hooks/useSyncStore";
import { cn } from "@/Library/cn";
import { convertTodToDate } from "@/Library/date";
import { message } from "@/Services/message";
import {
  AlertCircle,
  ArrowLeftCircle,
  MessagesSquare,
  SendHorizonal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "react-query";
import { Link, useParams } from "react-router-dom";
function Message({
  msg,
  my,
  loading,
  isSafe,
}: {
  msg: any;
  my: boolean;
  loading?: boolean;
  isSafe: boolean;
}) {
  return (
    <div
      className={cn(
        "p-4 pt-2 rounded-lg relative flex-none bg-gray-200 text-sm pb-6 shadow-lg dark:bg-gray-900 max-w-[80%] self-start overflow-hidden dark:text-gray-300",
        my && "dark:bg-gray-4a00 bg-gray-200 self-end dark:text-gray-900",
        loading && "opacity-50"
      )}
    >
      <div
        className={cn(
          "w-full text-xs font-bold mb-1 overflow-hidden whitespace-nowrap text-ellipsis",
          my && "text-right"
        )}
      >
        {msg.usernick}
      </div>
      {msg.content + `       `}
      <span className="absolute bottom-0 right-2 text-[10px] text-gray-400 font-light">
        {msg.tod && convertTodToDate(msg.tod)}
      </span>
      {!isSafe && (
        <AlertCircle className="bottom-1 left-1 absolute w-4 h-4 text-red-500" />
      )}
    </div>
  );
}
function Channel() {
  const { channelName } = useParams();
  const [input, setInput] = useState("");
  const tokenData = useTokenData();
  const usernick = `${tokenData?.mtUsername}@${tokenData?.apReg}`;
  const { store, sync } = useSyncStore(() => {
    setTimeout(
      () =>
        messagesRef.current &&
        messagesRef.current.scrollTo({
          top: messagesRef.current.scrollHeight,
          behavior: "smooth", // Optional: define the scrolling behavior (smooth or auto)
        }),
      500
    );
  });
  const [loadingMsg, setLoadingMsg] = useState<any | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  const { mutate: sendMessage } = useMutation(
    ({ messageStr }: { messageStr: string }) => {
      return message({
        msgContent: messageStr,
        channel: channelName!,
      });
    },
    {
      onSuccess() {
        sync();
        setLoadingMsg(null);
      },
      onMutate({ messageStr }) {
        setInput("");
        setLoadingMsg({ content: messageStr, usernick });
        setTimeout(
          () =>
            messagesRef.current &&
            messagesRef.current.scrollTo({
              top: messagesRef.current.scrollHeight,
              behavior: "smooth", // Optional: define the scrolling behavior (smooth or auto)
            }),
          1000
        );
      },
    }
  );

  useEffect(() => {
    messagesRef.current &&
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "instant", // Optional: define the scrolling behavior (smooth or auto)
      });
  }, [messagesRef.current]);

  return (
    <div className="grid grid-rows-[60px_1fr_60px] h-full ">
      <div className="border-b border-gray-200 dark:border-gray-600 dark:text-gray-400 flex items-center dark:bg-gray-900 text-lg">
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

      <div
        className=" shadow-inner flex flex-col gap-4 py-4 px-2 overflow-auto"
        ref={messagesRef}
      >
        {store?.messages?.[channelName!] &&
          Object.values(store?.messages?.[channelName!])
            ?.sort((a, b) => a.tod - b.tod)
            ?.map((msg: any, index) => (
              <Message
                msg={msg}
                my={msg.usernick === usernick}
                isSafe={msg.isSafe}
                key={msg.content + msg.usernick + index}
              />
            ))}
        {loadingMsg && (
          <Message msg={loadingMsg} my={true} loading={true} isSafe />
        )}
      </div>
      <div
        className={
          "border-t border-gray-200  dark:border-gray-700 dark:bg-gray-900 "
        }
      >
        <form
          className="flex items-stretch justify-stretch h-full w-full gap-2 p-2 "
          onSubmit={(e) => {
            e.preventDefault();
            input.length > 0 && sendMessage({ messageStr: input });
          }}
        >
          <Input
            className={
              "flex-1 h-full border-2 dark:bg-gray-200 bg-white text-gray-950"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button
            type="submit"
            className=" h-full  aspect-square p-0 transition-transform duration-100 active:scale-95 dark:bg-gray-700 dark:text-gray-100 "
          >
            <SendHorizonal />
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Channel;
