import { Button } from "@/Components/ui/button";
import { Card } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import useKeys from "@/Hooks/useKeys";
import useSyncStore from "@/Hooks/useSyncStore";
import { createChannel } from "@/Services/channel";
import { MessagesSquare } from "lucide-react";
import { useState } from "react";
import { useMutation } from "react-query";
import { Link } from "react-router-dom";

function Home() {
  const { store, sync } = useSyncStore();
  const { isPU } = useKeys();
  const [channelName, setChannelName] = useState("");

  const { mutate: addChannel } = useMutation(createChannel, {
    onSuccess() {
      sync();
      setChannelName("");
    },
  });
  return (
    <div className="p-1">
      <div className="flex flex-col m-5 items-stretch gap-4">
        <Card className="p-4 flex gap-4 ">
          <MessagesSquare /> Kanallar
        </Card>
        {isPU && (
          <div className="flex justify-stretch items-stretch h-12 gap-4">
            <Input
              placeholder="Kanal Adı..."
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
            />
            <Button onClick={() => addChannel(channelName)}>Ekle</Button>
          </div>
        )}
        {store &&
          Object.keys(store.messages)?.map((channel) => (
            <Link to={`/channel/${channel}`}>
              <Card className="p-8 flex gap-8 transition-transform duration-100 active:scale-95">
                {channel}
              </Card>
            </Link>
          ))}
      </div>
    </div>
  );
}

export default Home;
