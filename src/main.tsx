import { MicrosoftClarity } from "@/_demo/microsoft-clarity";
import React, { lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { registerDemoFeatureFlags } from "./_demo/demo-flags";

async function enableMocking() {
  if (import.meta.env.MODE !== "development") {
    return;
  }
  return true;
}

const ChaiBuilderDefault = lazy(() => import("@/Editor"));
const Preview = lazy(() => import("@/Preview"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <ChaiBuilderDefault />,
  },
  {
    path: "/preview/*",
    element: <Preview />,
  },
]);

// Register demo feature flags
registerDemoFeatureFlags();

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <RouterProvider router={router} />
      {import.meta.env.VITE_CLARITY_ID && <MicrosoftClarity clarityId={import.meta.env.VITE_CLARITY_ID} />}
    </React.StrictMode>,
  );
});
