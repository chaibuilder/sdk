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

export interface AIConfig {
  models: AIModel[];
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
