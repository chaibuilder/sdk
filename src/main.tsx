import { MicrosoftClarity } from "@/_demo/MicrosoftClarity";
import "@/index.css";
import { DevTools } from "jotai-devtools";
import "jotai-devtools/styles.css";
import React, { lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

async function enableMocking() {
  if (import.meta.env.MODE !== "development") {
    return;
  }
  return true;
}

const ChaiBuilderDefault = lazy(() => import("@/Editor.tsx"));
const Preview = lazy(() => import("@/Preview.tsx"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <ChaiBuilderDefault />,
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
