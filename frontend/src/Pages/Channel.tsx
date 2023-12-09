import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { message } from "@/Services/message";
import { ArrowLeftCircle, MessagesSquare, SendHorizonal } from "lucide-react";
import { useState } from "react";
import { useMutation } from "react-query";
import { Link, useParams } from "react-router-dom";

function Channel() {
  const { channelName } = useParams();
  const [input, setInput] = useState("");

  const { mutate: sendMessage } = useMutation(
    ({ messageStr }: { messageStr: string }) => {
      return message({
        msgContent: messageStr,
        channel: channelName!,
      });
    }
  );

  return (
    <div className="grid grid-rows-[60px_1fr_60px] h-full">
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

      <div className=" shadow-inner flex flex-col gap-4 py-4 px-2">
        <div className="p-4 rounded-lg shadow-lg bg-white max-w-[80%] self-start">
          Gelen Mesaj
        </div>
        <div className="p-4 rounded-lg shadow-lg bg-gray-200 max-w-[80%] self-end">
          Giden Mesaj
        </div>
      </div>
      <div className={"border-t border-gray-200 bg-white "}>
        <form
          className="flex items-stretch justify-stretch h-full w-full gap-2 p-2 "
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage({ messageStr: input });
          }}
        >
          <Input
            className={"flex-1 h-full border-2"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
