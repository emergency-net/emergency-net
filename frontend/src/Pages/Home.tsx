import { Card } from "@/Components/ui/card";
import { MessagesSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const CHANNELS = ["Genel"];

function Home() {
  return (
    <div>
      <div className="flex flex-col m-5 items-stretch gap-4">
        <Card className="p-4 flex gap-4 ">
          <MessagesSquare /> Kanallar
        </Card>
        {CHANNELS.map((channel) => (
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
