import { RouteObject } from "react-router-dom";
import Register from "./Pages/Register";
import Test from "./Pages/Test";

export const routes: RouteObject[] = [
  {
    path: "/",
    children: [
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "test",
        element: <Test />,
      },
    ],
  },
];
