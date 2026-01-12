import { db, safeQuery, schema } from "@/server/db";

export const AI_MODELS = [
  {
    id: "google/gemini-2.5-flash",
    multiplier: 0.5,
  },
  {
    id: "google/gemini-2.5-flash-pro",
    multiplier: 1.25,
  },
  {
    id: "google/gemini-3-pro",
    multiplier: 2.5,
  },
  {
    id: "openai/gpt-5",
    multiplier: 2,
  },
  {
    id: "openai/claude-haiku-4.5",
    multiplier: 1,
  },
  {
    id: "anthropic/claude-sonnet-4",
    multiplier: 3,
  },
  {
    id: "anthropic/claude-sonnet-4.5",
    multiplier: 3,
  },
  {
    id: "openai/gpt-4.1",
    multiplier: 2,
  },
];

const getModelMultiplier = (id: string) => {
  return AI_MODELS.find((model) => model.id === id)?.multiplier || 1;
};

export async function logAiRequestError({
  userId: authTokenOrUserId,
  startTime,
  error,
  model,
  prompt,
}: {
  userId: string;
  startTime: number;
  error: any;
  model: string;
  prompt: string;
}) {
  const errorStr = String(error);

  const totalDuration = startTime > 0 ? new Date().getTime() - startTime : 0;
  const payload = {
    model,
    totalDuration: String(totalDuration),
    error: errorStr,
    totalTokens: "0",
    tokenUsage: {},
    cost: 0,
    prompt,
    user: authTokenOrUserId,
    client: process?.env?.CHAIBUILDER_CLIENT_ID || "",
  };

  const { error: dbError } = await safeQuery(() => db!.insert(schema.aiLogs).values(payload));
  if (dbError) {
    console.error("Error logging AI request error:", dbError);
  }
}

export async function logAiRequest({
  userId,
  startTime,
  arg,
  prompt,
  model,
}: {
  userId: string;
  startTime: number;
  arg: any;
  prompt: string;
  model: string;
}) {
  const totalUsage = arg?.totalUsage;
  const cost = arg?.providerMetadata?.gateway?.cost;
  const totalDuration = startTime > 0 ? Math.floor(new Date().getTime() - startTime) : 0;

  const requestStartIndex = prompt.indexOf("USER REQUEST");
  prompt = prompt.substring(requestStartIndex).trim();
  const payload = {
    model,
    totalDuration: String(totalDuration),
    error: null,
    totalTokens: String(Math.round((totalUsage?.totalTokens ?? 0) * getModelMultiplier(model))),
    tokenUsage: totalUsage,
    cost,
    prompt,
    user: userId,
    client: process?.env?.CHAIBUILDER_CLIENT_ID || "",
  };
  const { error: dbError } = await safeQuery(() => db!.insert(schema.aiLogs).values(payload));
  if (dbError) {
    console.error("Error logging AI request:", dbError);
  }
}
