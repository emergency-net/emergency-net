import { RouteObject } from "react-router-dom";
import Register from "./Pages/Register";
import HelloWrapper from "./Components/HelloWrapper";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <HelloWrapper />,
    children: [
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
];
