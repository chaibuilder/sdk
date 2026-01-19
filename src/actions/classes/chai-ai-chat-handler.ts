import { AIChatOptions, ChaiBuilderPagesAIInterface } from "@/actions/export";
import { streamText, StreamTextResult } from "ai";
import { noop } from "lodash-es";
import { getAskAiSystemPrompt } from "./system-prompt";

const DEFAULT_MODEL = "google/gemini-2.5-flash";

export class ChaiAIChatHandler implements ChaiBuilderPagesAIInterface {
  private model: string = DEFAULT_MODEL;
  private temperature: number = 0.7;

  constructor(private options?: { model?: string; onFinish?: () => void; onError?: (error: Error) => void }) {
    this.model = options?.model ?? this.model;
  }

  async handleRequest(options: AIChatOptions, res?: any): Promise<StreamTextResult<any, any>> {
    const { messages, image, initiator = null, model } = options;

    // Use the provided model or fall back to the default
    const selectedModel = model || this.model;

    // Get the user messages (excluding system)
    const userMessages = messages.filter((m: any) => m.role !== "system");
    const lastUserMessage = userMessages[userMessages.length - 1];

    const aiMessages = image
      ? [
          ...userMessages.slice(0, -1),
          {
            role: "user",
            content: [
              {
                type: "text",
                text: lastUserMessage.content,
              },
              {
                type: "image",
                image: image,
              },
            ],
          },
        ]
      : messages;

    const result = streamText({
      model: selectedModel,
      system: getAskAiSystemPrompt(initiator),
      messages: aiMessages,
      temperature: this.temperature,
      onFinish: this.options?.onFinish ?? noop,
      onError: this.options?.onError ?? noop,
    });
    if (res) result.pipeTextStreamToResponse(res);
    return result;
  }

  isConfigured(): boolean {
    return true;
  }
}
