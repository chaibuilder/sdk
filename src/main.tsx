import React, { lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import ChaiBuilderCustom from "./EditorCustom.tsx";
import { DevTools } from "jotai-devtools";

async function enableMocking() {
  if (import.meta.env.MODE !== "development") {
    return;
  }

  // const { worker } = await import("./__dev/mock/browser");

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return true;
}

const ChaiBuilderDefault = lazy(() => import("./Editor.tsx"));
const Preview = lazy(() => import("./Preview.tsx"));
const RJSF = lazy(() => import("./RJSF.tsx"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <ChaiBuilderDefault />,
  },
  {
    path: "/custom",
    element: <ChaiBuilderCustom />,
  },
  {
    path: "/preview",
    element: <Preview />,
  },
  {
    path: "/rjsf",
    element: <RJSF />,
  },
]);

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <DevTools />
      <RouterProvider router={router} />
    </React.StrictMode>,
  );
});
