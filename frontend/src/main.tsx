import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import axios from "axios";
import QueryProvider from "./Components/Providers/QueryClientProvider.tsx";
import "./global.css";

axios.defaults.headers.common = {
  "Content-Type": "application/json", // Sets content type to JSON
  "Access-Control-Allow-Origin": "*",
};
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </React.StrictMode>
);
