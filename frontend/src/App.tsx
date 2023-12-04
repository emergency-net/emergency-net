import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { routes } from "./routes";
import { Toaster } from "./Components/ui/toaster";

const router = createBrowserRouter(routes);

function App() {
  return (
    <div className="absolute inset-0 h-0 bg-gray-100">
      <Toaster />
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
