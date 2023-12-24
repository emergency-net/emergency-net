import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/Components/ui/alert-dialog";
import { Button } from "@/Components/ui/button";
import { Card } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import useKeys from "@/Hooks/useKeys";
import useSyncStore from "@/Hooks/useSyncStore";
import { createChannel, destroyChannel } from "@/Services/channel";
import { Delete, DeleteIcon, MessagesSquare, Trash2 } from "lucide-react";
import { useState } from "react";
import { useMutation } from "react-query";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const { store, sync } = useSyncStore();
  const { isPU } = useKeys();
  const [channelName, setChannelName] = useState("");
  const navigate = useNavigate();

  const { mutate: addChannel } = useMutation(createChannel, {
    onSuccess() {
      sync();
      setChannelName("");
    },
  });

  const { mutate: deleteChannel } = useMutation(destroyChannel, {
    onSuccess() {
      sync();
    },
  });
  return (
    <div className="p-1">
      <div className="flex flex-col m-5 items-stretch gap-4">
        <Card className="p-4 flex gap-4 ">
          <MessagesSquare /> Kanallar
        </Card>
        {isPU && (
          <div className="flex justify-stretch items-stretch h-10 gap-4">
            <Input
              placeholder="Kanal Adı..."
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="h-full"
            />
            <Button onClick={() => addChannel(channelName)} className="h-full">
              Ekle
            </Button>
          </div>
        )}
        {store &&
          Object.keys(store.messages)?.map((channel) => (
            <Card
              onClick={() => navigate(`/channel/${channel}`)}
              className="p-8 flex gap-8 transition-transform duration-100 active:scale-95 relative"
            >
              {channel}
              <div
                className="absolute right-2"
                onClick={(e) => e.stopPropagation()}
              >
                <AlertDialog>
                  <AlertDialogTrigger className="text-red-500">
                    <Trash2 />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Kanalı silmek istediğinize emin misiniz?
                      </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>İptal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteChannel(channel)}>
                        Devam Et
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}

export default Home;
