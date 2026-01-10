import { supabase } from "@/routes/supabase-admin";
import { getChaiAction } from "@/server/actions/actions-registery";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express } from "express";
import fileUpload from "express-fileupload";
import "./register";
import { registerPageTypes } from "./registerPageTypes";

dotenv.config();

export const app: Express = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    abortOnLimit: true,
    responseOnLimit: "File size limit has been reached (max: 50MB)",
  }),
);
const apiKey = process.env["CHAIBUILDER_APP_ID"]!;

export type GlobalData = {
  lang: string;
  logo: string;
  title: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  social: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
};

registerPageTypes();

app.post("/chai/api", async (req, res) => {
  handleApi(req, res);
});

if (!process.env["VITE"]) {
  const frontendFiles = process.cwd() + "/dist";
  app.use(express.static(frontendFiles));
  app.get("/*", (_, res) => {
    res.send(frontendFiles + "/index.html");
  });
  app.listen(process.env["PORT"]);
}

async function handleApi(req: express.Request, res: express.Response) {
  const authorization = req.headers["authorization"] as string;
  const body = req.body;
  let authTokenOrUserId: string = "";
  authTokenOrUserId = (authorization ? authorization.split(" ")[1] : "") as string;
  const supabaseUser = await supabase.auth.getUser(authTokenOrUserId);
  if (supabaseUser.error) {
    // If the token is invalid or expired, return a 401 response
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  authTokenOrUserId = supabaseUser.data.user?.id || "";
  try {
    // Handle AI chat streaming separately
    // if (body.action === "ASK_AI") {
    //   const aiHandler = chaiPages.getAIHandler();

    //   if (!aiHandler || !aiHandler.isConfigured()) {
    //     res.status(500).json({ error: "AI is not configured" });
    //     return;
    //   }

    //   await aiHandler.handleRequest(body.data, res);
    //   return;
    // }

    // Handle all other actions normally
    const action = getChaiAction(body.action);
    if (!action) {
      res.status(404).json({ error: "Action not found" });
      return;
    }
    action.setContext({
      appId: apiKey,
      userId: authTokenOrUserId,
    });
    const response = await action.execute(body.data);
    return response;
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
