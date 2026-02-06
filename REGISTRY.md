# shadcn Registry: How to Create and Publish Blocks

This guide explains how to create, build, and publish custom blocks using the [shadcn registry](https://ui.shadcn.com/docs/registry/getting-started) for `@chaibuilder/sdk`.

## Overview

The shadcn registry lets you publish reusable components as static JSON files served over HTTP. Consumers install them using:

```bash
pnpm dlx shadcn@latest add <url>
```

When installed:

- **Custom blocks** → go into `blocks/<block-name>/` in the consumer's project
- **shadcn UI dependencies** (button, card, etc.) → go into `components/ui/` as usual

## Project Structure

```
sdk/
├── registry.json                          # Registry entry point (defines all blocks)
├── registry/
│   └── <block-name>/
│       └── <block-name>.tsx               # Your block component source
├── public/r/
│   └── <block-name>.json                  # Auto-generated (do not edit manually)
└── package.json                           # Contains "registry:build" script
```

## Step-by-Step: Adding a New Block

### Step 1: Create the Component

Create a file at `registry/<block-name>/<block-name>.tsx`:

```tsx
// registry/hello-world/hello-world.tsx
import { Button } from "@/components/ui/button"

export function HelloWorld() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Hello World</h1>
        <p className="text-muted-foreground">
          A simple hello world block from @chaibuilder/sdk.
        </p>
        <Button size="lg">Get Started</Button>
      </div>
    </div>
  )
}
```

> **Note:** Use `@/components/ui/...` imports for shadcn UI dependencies. These resolve on the consumer's side when installed.

### Step 2: Register It in `registry.json`

Add an entry to the `items` array in `registry.json` at the project root:

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "chaibuilder",
  "homepage": "https://chaibuilder.com",
  "items": [
    {
      "name": "hello-world",
      "type": "registry:block",
      "title": "Hello World",
      "description": "A simple hello world component.",
      "registryDependencies": ["button"],
      "files": [
        {
          "path": "registry/hello-world/hello-world.tsx",
          "type": "registry:file",
          "target": "~/blocks/hello-world/hello-world.tsx"
        }
      ]
    }
  ]
}
```

#### Key Fields

| Field | Purpose |
|-------|---------|
| `name` | Unique identifier for the block |
| `type` | Always `"registry:block"` for custom blocks |
| `title` | Human-readable name |
| `description` | What the block does (helps LLMs understand it) |
| `registryDependencies` | shadcn UI components it depends on (e.g. `["button", "card", "input"]`) — auto-installed into `components/ui/` |
| `dependencies` | npm packages it needs (e.g. `["zod", "sonner"]`) — auto-installed via package manager |
| `files[].path` | Path to source file in the registry directory |
| `files[].type` | Use `"registry:file"` with a `target` to control output location |
| `files[].target` | Where the file lands in the consumer's project. `~` = project root |

### Step 3: Build the Registry

```bash
pnpm registry:build
```

This generates `public/r/<name>.json` for each item (e.g. `public/r/hello-world.json`).

### Step 4: Test Locally

With the dev server running (`pnpm dev`), install in a consumer project:

```bash
pnpm dlx shadcn@latest add http://localhost:5173/r/hello-world.json
```

Verify the output:

```
consumer-project/
├── blocks/hello-world/hello-world.tsx   ← Your custom block
├── components/ui/button.tsx             ← shadcn UI dependency
└── lib/utils.ts                         ← shadcn utility (auto-created)
```

### Step 5: Publish

Deploy the project so `public/r/` is served as static files. Once live:

```bash
pnpm dlx shadcn@latest add https://chaibuilder.com/r/hello-world.json
```

## Command Breakdown

```
pnpm dlx shadcn@latest add http://localhost:5173/r/hello-world.json
│        │               │   │
│        │               │   └── URL to the registry item JSON
│        │               └── "install a component" subcommand
│        └── shadcn CLI (downloaded temporarily, not installed globally)
└── package manager
```

## Multiple Files Per Block

A block can contain multiple files (components, hooks, libs):

```json
{
  "name": "my-block",
  "type": "registry:block",
  "files": [
    {
      "path": "registry/my-block/my-block.tsx",
      "type": "registry:file",
      "target": "~/blocks/my-block/my-block.tsx"
    },
    {
      "path": "registry/my-block/use-my-block.ts",
      "type": "registry:file",
      "target": "~/blocks/my-block/use-my-block.ts"
    }
  ]
}
```

## Quick Checklist

1. ✅ Create `registry/<name>/<name>.tsx`
2. ✅ Add entry to `registry.json` → `items[]`
3. ✅ Run `pnpm registry:build`
4. ✅ Test with `pnpm dlx shadcn@latest add http://localhost:5173/r/<name>.json`
5. ✅ Commit and deploy

## References

- [shadcn Registry Docs](https://ui.shadcn.com/docs/registry/getting-started)
- [Registry Item Schema](https://ui.shadcn.com/docs/registry/registry-item-json)
- [Registry JSON Schema](https://ui.shadcn.com/docs/registry/registry-json)
- [Namespaced Registries](https://ui.shadcn.com/docs/registry/namespace)
