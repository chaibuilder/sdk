# Types Reference

Complete type definitions for ChaiBuilder SDK.

## ChaiBlock

The core block type representing a single element in the builder.

```typescript
type ChaiBlock<T = Record<string, any>> = {
  _id: string; // Unique identifier
  _type: string; // Block type (e.g., "Box", "Text", "Image")
  _name?: string; // Optional display name
  _parent?: string | null; // Parent block ID
  _bindings?: Record<string, string>; // Data bindings
  _libBlock?: string; // Library block reference
} & T; // Additional block-specific properties
```

### Example

```typescript
const block: ChaiBlock = {
  _id: "block-123",
  _type: "Box",
  _parent: "parent-456",
  styles: "p-4 bg-white rounded-lg",
  tag: "section",
};
```

---

## ChaiBuilderEditorProps

Props for the main `ChaiBuilderEditor` component.

```typescript
interface ChaiBuilderEditorProps {
  // Core
  blocks?: ChaiBlock[];
  pageId?: string;
  loading?: boolean;
  children?: React.ReactNode;

  // Callbacks
  onSave?: (data: SavePageData) => Promise<boolean | Error>;
  onSaveStateChange?: (status: "SAVED" | "SAVING" | "UNSAVED") => void;
  onError?: (error: Error) => void;

  // Auto-save
  autoSave?: boolean;
  autoSaveActionsCount?: number;

  // User & Permissions
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  permissions?: string[];

  // Theme
  theme?: Partial<ChaiThemeValues>;
  themePresets?: Record<string, Partial<ChaiThemeValues>>[];
  themeOptions?: (defaults: ChaiBuilderThemeOptions) => ChaiBuilderThemeOptions;
  themePanelComponent?: React.ComponentType;

  // i18n
  locale?: string;
  fallbackLang?: string;
  languages?: string[];
  translations?: Record<string, Record<string, any>>;
  htmlDir?: "ltr" | "rtl";

  // AI
  askAiCallBack?: (
    type: "styles" | "content",
    prompt: string,
    blocks: ChaiBlock[],
    lang: string,
  ) => Promise<AskAiResponse>;

  // Partial Blocks
  getPartialBlocks?: () => Promise<Record<string, { type: string; name: string; description?: string }>>;
  getPartialBlockBlocks?: (partialBlockKey: string) => Promise<ChaiBlock[]>;

  // Data
  collections?: ChaiCollection[];
  pageExternalData?: Record<string, any>;
  getBlockAsyncProps?: (args: { block: ChaiBlock }) => Promise<Record<string, any>>;

  // Page Types
  pageTypes?: PageType[];
  searchPageTypeItems?: (pageTypeKey: string, query: string) => Promise<PageTypeItem[]>;
  gotoPage?: (args: { pageId: string; lang: string }) => void;

  // Layout & UI
  layout?: React.ComponentType;
  previewComponent?: React.ComponentType;
  breakpoints?: Breakpoint[];

  // Feature Flags
  flags?: {
    librarySite?: boolean;
    copyPaste?: boolean;
    exportCode?: boolean;
    darkMode?: boolean;
    dataBinding?: boolean;
    importHtml?: boolean;
    importTheme?: boolean;
    gotoSettings?: boolean;
    dragAndDrop?: boolean;
    validateStructure?: boolean;
    designTokens?: boolean;
  };

  // Advanced
  structureRules?: StructureRule[];
  designTokens?: DesignTokens;
  siteWideUsage?: SiteWideUsage;
  debugLogs?: boolean;
}
```

---

## ChaiThemeValues

Theme configuration values.

```typescript
type ChaiThemeValues = {
  fontFamily: {
    heading: string;
    body: string;
  };
  borderRadius: string;
  colors: {
    background: [HexColor, HexColor];
    foreground: [HexColor, HexColor];
    primary: [HexColor, HexColor];
    "primary-foreground": [HexColor, HexColor];
    secondary: [HexColor, HexColor];
    "secondary-foreground": [HexColor, HexColor];
    muted: [HexColor, HexColor];
    "muted-foreground": [HexColor, HexColor];
    accent: [HexColor, HexColor];
    "accent-foreground": [HexColor, HexColor];
    destructive: [HexColor, HexColor];
    "destructive-foreground": [HexColor, HexColor];
    border: [HexColor, HexColor];
    input: [HexColor, HexColor];
    ring: [HexColor, HexColor];
    card: [HexColor, HexColor];
    "card-foreground": [HexColor, HexColor];
    popover: [HexColor, HexColor];
    "popover-foreground": [HexColor, HexColor];
    [key: string]: [HexColor, HexColor]; // Additional custom colors
  };
};

type HexColor = string; // e.g., "#ffffff"
```

---

## SavePageData

Data passed to the `onSave` callback.

```typescript
type SavePageData = {
  autoSave: boolean;
  blocks: ChaiBlock[];
  theme?: ChaiThemeValues;
  needTranslations?: boolean;
  designTokens: DesignTokens;
};
```

---

## ChaiCollection

Data collection definition.

```typescript
type ChaiCollection = {
  id: string;
  name: string;
  description?: string;
  filters?: FilterOptions[];
  sorts?: SortOptions[];
};

type FilterOptions = {
  id: string;
  name: string;
  description?: string;
};

type SortOptions = {
  id: string;
  name: string;
  description?: string;
};
```

---

## Breakpoint

Custom breakpoint definition.

```typescript
type Breakpoint = {
  title: string;
  content: string;
  breakpoint: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | string;
  icon: React.ReactNode;
  width: number;
};
```

---

## ChaiLibrary & ChaiLibraryBlock

Block library types.

```typescript
type ChaiLibrary<T = Record<string, any>> = {
  id: string;
  name: string;
  blocks?: ChaiLibraryBlock[];
  description?: string;
} & T;

type ChaiLibraryBlock<T = Record<string, any>> = {
  id: string;
  group: string;
  name: string;
  preview?: string;
  tags?: string[];
  description?: string;
} & T;
```

---

## ChaiAsset

Asset/media type.

```typescript
type ChaiAsset = {
  url: string;
  id?: string;
  thumbnailUrl?: string;
  description?: string;
  width?: number;
  height?: number;
};
```

---

## DesignTokens

Design token definitions.

```typescript
interface DesignTokens {
  [uniqueId: string]: {
    name: string;
    value: string;
  };
}
```

---

## StructureRule

HTML structure validation rule.

```typescript
type StructureRule = {
  name: string;
  description: string;
  validate: (blocks: ChaiBlock[], tree: any[]) => StructureError[];
};

type StructureError = {
  id: string;
  message: string;
  severity: "error" | "warning";
  blockId?: string;
};
```

---

## AskAiResponse

AI callback response type.

```typescript
type AskAiResponse = {
  blocks?: Array<{ _id: string } & Partial<ChaiBlock>>;
  usage?: Record<any, number>;
  error?: any;
};
```

---

## PageType & PageTypeItem

Page type definitions.

```typescript
type PageType = {
  key: string;
  name: string;
};

type PageTypeItem = {
  id: string;
  name: string;
  slug?: string;
};
```

---

## ChaiSidebarPanel

Sidebar panel configuration.

```typescript
interface ChaiSidebarPanel {
  id: string;
  position: "top" | "bottom";
  view?: "standard" | "modal" | "overlay" | "drawer";
  button: React.ComponentType<{
    isActive: boolean;
    show: () => void;
    panelId: string;
    position: "top" | "bottom";
  }>;
  label: string;
  panel?: React.ComponentType;
  width?: number;
  isInternal?: boolean;
  icon?: React.ReactNode;
}
```

---

## ChaiRenderBlockProps

Props passed to block render components.

```typescript
type ChaiRenderBlockProps<T> = {
  blockProps: Record<string, string>;
  children?: React.ReactNode;
  inBuilder: boolean;
} & T;
```

---

## ChaiBuilderThemeOptions

Theme options configuration.

```typescript
type ChaiBuilderThemeOptions = {
  fontFamily: false | Record<string, string>;
  borderRadius: false | string;
  colors:
    | false
    | {
        group: string;
        items: Record<string, [string, string]>;
      }[];
};
```
