import AreYouSureDialog from "@/Components/AreYouSureDialog";
import BanDialog from "@/Components/BanDialog";
import { Button } from "@/Components/ui/button";
import { Card } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { useAPData } from "@/Hooks/useAPData";
import useKeys from "@/Hooks/useKeys";
import useSyncStore from "@/Hooks/useSyncStore";
import { logout } from "@/Library/util";
import { createChannel, destroyChannel } from "@/Services/channel";
import { AlertTriangle, MessagesSquare, Trash2 } from "lucide-react";
import { useState } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

function Home() {
  const { store, sync } = useSyncStore();
  const { isPU } = useKeys();
  const [channelName, setChannelName] = useState("");
  const [banOpen, setBanOpen] = useState(false);
  const navigate = useNavigate();
  const APData = useAPData();

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
    <div className="p-1 relative">
      <div className="flex flex-col m-5 items-stretch gap-4">
        <AreYouSureDialog
          title="Hesabı kapamak istediğinize emin misiniz? (Geri alınamaz)"
          onAccept={logout}
        >
          <Button
            className="
        !bg-red-500 w-min text-xs "
          >
            Hesabı Kapa
          </Button>
        </AreYouSureDialog>
        {isPU && APData?.type === "non_certified" && (
          <div className="flex justify-stretch items-stretch h-10 ,">
            <Button className="h-full">AP'yi güvenilir yap</Button>
          </div>
        )}
        {APData?.type === "non_certified" && (
          <Card className="p-4 flex gap-2 text-sm">
            <AlertTriangle className="flex-none " /> Bağlandığınız AP güvenli
            değildir, buradan göndereceğiniz mesajlar güvensiz olarak
            işaretlenecektir.
          </Card>
        )}
        <Card className="p-4 flex gap-4 ">
          <MessagesSquare /> Kanallar
        </Card>
        {isPU && (
          <>
            <div className="flex justify-stretch items-stretch h-10 gap-4">
              <Input
                placeholder="Kanal Adı..."
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="h-full"
              />
              <Button
                onClick={() => addChannel(channelName)}
                className="h-full"
              >
                Ekle
              </Button>
            </div>
          </>
        )}

        {/* <Button onClick={() => setBanOpen(true)}>PU Banla</Button>
        <BanDialog
          open={banOpen}
          onClose={() => setBanOpen(false)}
          onSubmit={console.log}
        /> */}
        {store &&
          store.channels
            .filter((c: any) => c.isActive)
            ?.map((channel: any) => (
              <Card
                onClick={() => navigate(`/channel/${channel.channelName}`)}
                className="p-8 flex gap-8 transition-transform duration-100 active:scale-95 relative"
                key={channel.channelName}
              >
                {channel.channelName}
                {isPU && (
                  <AreYouSureDialog
                    title="Kanalı silmek istediğinize emin misiniz?"
                    onAccept={() => deleteChannel(channel.channelName)}
                    className="absolute right-2 text-red-500"
                  >
                    <Trash2 />
                  </AreYouSureDialog>
                )}
              </Card>
            ))}
      </div>
      <span className="text-xs text-gray-400 fixed bottom-1 right-1">
        {APData?.id} - {APData?.type}
      </span>
    </div>
  );
}

export default Home;
