import { RouteObject } from "react-router-dom";
import Register from "./Pages/Register";
import HelloWrapper from "./Components/HelloWrapper";
import Home from "./Pages/Home";
import Channel from "./Pages/Channel";
import SyncWrapper from "./Components/SyncWrapper";
import PURegister from "./Pages/PURegister";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <HelloWrapper />,
    children: [
      {
        path: "",
        element: <SyncWrapper />,
        children: [
          {
            path: "register",
            element: <Register />,
          },
          {
            path: "PUregister",
            element: <PURegister />,
          },
          {
            path: "home",
            element: <Home />,
          },
          {
            path: "channel/:channelName",
            element: <Channel />,
          },
        ],
      },
    ],
  },
];
