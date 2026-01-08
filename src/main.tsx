import React, { lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { registerDemoFeatureFlags } from "./routes/demo/demo-flags";
import { MicrosoftClarity } from "./routes/demo/microsoft-clarity";

const ChaiBuilderDefault = lazy(() => import("./routes/builder"));
const Preview = lazy(() => import("./routes/page-preview"));
const ChaiBuilderCustom = lazy(() => import("./routes/custom-layout"));
const WebsiteBuilder = lazy(() =>
  import("./routes/website-builder").then((module) => ({ default: module.WebsiteBuilder })),
);

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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    {import.meta.env.VITE_CLARITY_ID && <MicrosoftClarity clarityId={import.meta.env.VITE_CLARITY_ID} />}
  </React.StrictMode>,
);
