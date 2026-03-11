# AI Configuration Context

## Overview

The AI panel now uses a generic, reusable configuration context instead of hardcoded AI models. This allows you to pass custom models and other configuration options from the `AiPanelContent` component.

## Usage

### Basic Usage (with default models)

```tsx
import { AiPanelContent } from "./ai-panel-content";

// Uses default hardcoded models
<AiPanelContent />;
```

### Custom Models

```tsx
import { AiPanelContent } from "./ai-panel-content";

const customModels = [
  {
    id: "custom/model-1",
    name: "Custom Model 1",
    provider: "custom",
    description: "1x Credits",
    multiplier: 1,
  },
  // ... more models
];

<AiPanelContent config={{ models: customModels }} />;
```

### Extending Configuration

The `AIConfig` interface is extensible, allowing you to add other configuration options:

```tsx
<AiPanelContent
  config={{
    models: customModels,
    apiEndpoint: "https://custom-api.com",
    maxTokens: 4000,
    // ... any other config
  }}
/>
```

## Architecture

### Context Provider: `AIConfigProvider`

- **Location**: `src/pages/panels/ai-panel/ai-models-context.tsx`
- **Purpose**: Provides AI configuration to all child components
- **Props**:
  - `config?: Partial<AIConfig>` - Optional configuration object
  - Falls back to hardcoded `AI_MODELS` if not provided

### Hooks

#### `useAIConfig()`

Returns the full configuration object:

```tsx
const { config } = useAIConfig();
// config.models, config.apiEndpoint, etc.
```

#### `useAIModels()`

Convenience hook that returns just the models:

```tsx
const { models } = useAIModels();
```

### Type Definitions

```typescript
export type AIModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  multiplier: number;
};

export interface AIConfig {
  models: AIModel[];
  [key: string]: any; // Extensible for future config options
}
```

## Components Updated

All components now consume models from context instead of hardcoded imports:

1. **`AiPanelContent`** - Wraps everything with `AIConfigProvider`
2. **`ModelSelectorDropdown`** - Uses `useAIModels()` to get available models
3. **`AiPromptInput`** - Uses `useAIModels()` for default model selection
4. **`AiPanelForDefaultLang`** - Uses `useAIModels()` for model fallback
5. **`AiPanelForOtherLang`** - Uses `useAIModels()` for model fallback

## Benefits

1. **No Prop Drilling**: Configuration is available via context throughout the component tree
2. **Optional Override**: Pass custom models only when needed, fallback to defaults otherwise
3. **Extensible**: Add new configuration options without breaking existing code
4. **Type-Safe**: Full TypeScript support with proper type definitions
5. **Reusable**: The context pattern can be used for other configuration needs
