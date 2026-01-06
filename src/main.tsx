import React, { lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { registerDemoFeatureFlags } from "./routes/demo/demo-flags";
import { MicrosoftClarity } from "./routes/demo/microsoft-clarity";
import { WebsiteBuilder } from "./routes/website-builder";

async function enableMocking() {
  if (import.meta.env.MODE !== "development") {
    return;
  }
  return true;
}

const ChaiBuilderDefault = lazy(() => import("./routes/builder"));
const Preview = lazy(() => import("./routes/page-preview"));
const ChaiBuilderCustom = lazy(() => import("./routes/custom-layout"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <ChaiBuilderDefault />,
  },
  {
    path: "/preview/*",
    element: <Preview />,
  },
  {
    path: "/custom",
    element: <ChaiBuilderCustom />,
  },
  {
    path: "/website",
    element: <WebsiteBuilder />,
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
