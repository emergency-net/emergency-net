import { RouteObject } from "react-router-dom";
import Register from "./Pages/Register";
import HelloWrapper from "./Components/HelloWrapper";
import Home from "./Pages/Home";
import Channel from "./Pages/Channel";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <HelloWrapper />,
    children: [
      {
        path: "register",
        element: <Register />,
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
];
