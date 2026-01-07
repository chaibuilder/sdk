# Guidelines for Adding Hooks and Components

## Hooks that Use External Dependencies

When adding new hooks or components that depend on external libraries like `@tanstack/react-query`, follow these guidelines to prevent runtime errors:

### 1. QueryClient Dependencies

If your hook uses `useQuery`, `useMutation`, or any other react-query hooks:

**❌ DON'T** export the hook directly from `@/core/hooks/index.ts` if it will be used in panels or components that are registered at module level.

**✅ DO** either:
- Lazy-load the component that uses the hook
- Ensure the consuming application wraps the builder with `QueryClientProvider`
- Document the QueryClient requirement clearly in the hook's JSDoc

### 2. Side-Effect Imports

**❌ DON'T** use side-effect imports at the module level:
```typescript
// Bad - executes immediately when module is loaded
import "@/some/side-effect-module";

export function myFunction() {
  // ...
}
```

**✅ DO** move side-effect imports inside functions:
```typescript
export function myFunction() {
  // Good - only executes when function is called
  import("@/some/side-effect-module");
  // ...
}
```

### 3. Panel Registrations

When registering panels that use hooks with external dependencies:

**✅ DO** use arrow functions for panel components:
```typescript
registerChaiSidebarPanel("my-panel", {
  button: MyButton,
  panel: () => <MyPanelComponent />, // Arrow function - evaluated when rendered
});
```

**❌ DON'T** eagerly evaluate components:
```typescript
registerChaiSidebarPanel("my-panel", {
  button: MyButton,
  panel: <MyPanelComponent />, // Bad - evaluated at module load
});
```

## Example: Adding a Pages Panel with QueryClient

```typescript
// pages-panel.tsx
import { useQuery } from '@tanstack/react-query';

// This component requires QueryClientProvider in the parent tree
export const PagesPanel = () => {
  const { data } = useQuery({
    queryKey: ['pages'],
    queryFn: fetchPages,
  });
  
  return <div>{/* render pages */}</div>;
};

// panel-registration.ts
import { registerChaiSidebarPanel } from '@/core/main';

// Register with lazy loading
registerChaiSidebarPanel("pages-panel", {
  button: PagesButton,
  // Use arrow function to defer evaluation
  panel: () => <PagesPanel />,
});
```

## Testing Your Changes

Before committing hooks or components with external dependencies:

1. Test that the builder loads correctly on the `/` route
2. Verify no "QueryClient not set" errors appear in the console
3. Check that your panel/component only loads when actually used
4. Run `npm test` to ensure no regressions

## Related Files

- `src/core/hooks/use-current-page.ts` - Example of a basic hook with documentation
- `src/extentions.tsx` - Example of moving side-effect imports into functions
- `src/core/components/layout/root-layout.tsx` - Example of proper panel registrations
