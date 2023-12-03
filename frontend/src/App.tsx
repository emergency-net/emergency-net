import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { routes } from "./routes";

const router = createBrowserRouter(routes);

function App() {
  return (
    <div className="min-h-screen relative h-0 bg-gray-100">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
