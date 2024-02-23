import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ChaiStudio from "./ChaiStudio";
import Preview from "./Preview";
import ChaiEditor from "./Editor";
import "./blocks";
import "./data-providers/data";

async function enableMocking() {
  if (import.meta.env.MODE !== "development") {
    return;
  }

  const { worker } = await import("./mock/browser");

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start();
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <ChaiEditor />,
  },
  {
    path: "/studio",
    element: <ChaiStudio />,
  },
  {
    path: "/preview",
    element: <Preview />,
  },
]);

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  );
});
