import { DevTools } from "jotai-devtools";
import "jotai-devtools/styles.css";
import React, { lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ChaiBuilderCustom from "./EditorCustom.tsx";
import { MicrosoftClarity } from "./__dev/MicrosoftClarity.tsx";
import "./index.css";

async function enableMocking() {
  if (import.meta.env.MODE !== "development") {
    return;
  }
  return true;
}

const ChaiBuilderDefault = lazy(() => import("./Editor.tsx"));
const Preview = lazy(() => import("./Preview.tsx"));

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
]);

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <RouterProvider router={router} />
      <DevTools position="bottom-right" />
      {import.meta.env.VITE_CLARITY_ID && <MicrosoftClarity clarityId={import.meta.env.VITE_CLARITY_ID} />}
    </React.StrictMode>,
  );
});
