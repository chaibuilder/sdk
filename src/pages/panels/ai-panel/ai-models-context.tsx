"use client";

import { createContext, ReactNode, useContext } from "react";
import { AI_MODELS } from "./models";

export type AIModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  multiplier: number;
};

export type AICompletionEvent = {
  type: "completion";
  content: string;
  model: string;
  timestamp: number;
};

export type AIErrorEvent = {
  type: "error";
  error: Error | string;
  model?: string;
  timestamp: number;
};

export type AIStreamStartEvent = {
  type: "stream_start";
  model: string;
  timestamp: number;
};

export type AIEvent = AICompletionEvent | AIErrorEvent | AIStreamStartEvent;

export type AISuccessCallback = {
  content: string;
  model: string;
  timestamp: number;
};

export type AIErrorCallback = {
  error: Error | string;
  model: string;
  timestamp: number;
};

export type AICompleteCallback = {
  success: boolean;
  content?: string;
  error?: Error | string;
  model: string;
  timestamp: number;
};

export interface AIConfig {
  models: AIModel[];
  onAIEvent?: (event: AIEvent) => void;
  onSuccess?: (data: AISuccessCallback) => void;
  onError?: (data: AIErrorCallback) => void;
  onComplete?: (data: AICompleteCallback) => void;
  [key: string]: any;
}

interface AIConfigContextType {
  config: AIConfig;
}

const AIConfigContext = createContext<AIConfigContextType | undefined>(undefined);

interface AIConfigProviderProps {
  children: ReactNode;
  config?: Partial<AIConfig>;
}

export const AIConfigProvider = ({ children, config }: AIConfigProviderProps) => {
  const defaultConfig: AIConfig = {
    models: AI_MODELS,
    ...config,
  };

  const value = {
    config: {
      ...defaultConfig,
      models: config?.models || defaultConfig.models,
    },
  };

  return <AIConfigContext.Provider value={value}>{children}</AIConfigContext.Provider>;
};

export const useAIConfig = () => {
  const context = useContext(AIConfigContext);
  if (context === undefined) {
    throw new Error("useAIConfig must be used within AIConfigProvider");
  }
  return context;
};

export const useAIModels = () => {
  const { config } = useAIConfig();
  return { models: config.models };
};
