import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { routes } from "./routes";
import { Toaster } from "./Components/ui/toaster";

const router = createBrowserRouter(routes);

function App() {
  return (
    <div className="contents dark">
      <div className="relative min-h-[100dvh] h-0 bg-gray-100 dark:bg-gray-950 dark:text-gray-200">
        <Toaster />
        <RouterProvider router={router} />
      </div>
    </div>
  );
}

export default App;
