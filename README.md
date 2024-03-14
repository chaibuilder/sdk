# Chai Builder - Low-Code Visual Builder

Chai Builder is an Open Source Low Code React + Tailwind CSS Visual Builder. Its a simple React component which can be integrated into any React based framework.

### Try Chai Builder:
[Demo Link](https://chaibuilder-demo.vercel.app)
&nbsp;&nbsp; |  &nbsp;&nbsp;  [GitHub](https://github.com/surajair/demo)

---

### Getting Started:

Step 1: Install the packages
```bash
npm install @chaibuilder/sdk @chaibuilder/runtime tailwindcss
```

Step 2: Add a custom tailwind config.
Create a new file: `tailwind.chaibuilder.config.ts`. <br /> Pass the path to your source files.
```tsx
import { chaiBuilderTailwindConfig } from "@chaibuilder/sdk/tailwind";
export default chaiBuilderTailwindConfig(["./src/**/*.{js,ts,jsx,tsx}"]);

```

Step 3: Create a new `chaibuilder.tailwind.css`
```css
@config "./tailwind.chaibuilder.config.ts";

@tailwind base;
@tailwind components;
@tailwind utilities;
```

Step 4: Add the builder to your page.
```tsx
import "./chaibuilder.tailwind.css";
import "@chaibuilder/sdk/styles";
import {ChaiBuilderEditor} from "@chaibuilder/sdk";

const BuilderFullPage = () => {
  return  (
      <ChaiBuilderEditor
          blocks={[]}
          onSavePage={async (blocks) => await saveBlocks(blocks)}
          onSaveBrandingOptions={async (branding) => await saveBranding(branding)}
      />
  );
}
```
    
Step 5: Render the blocks on your page.
```tsx
export default async () => {
    const styles = await getStylesForBlocks(blocks, brandingOptions);
    return <>
        <style>{styles}</style>
        <RenderChaiBlocks blocks={blocks} />
    </>
}
```

## Support
If you like the project, you can assist us in expanding. ChaiBuilder is a collaborative endeavor crafted by developers in their free time. We value every contribution, no matter how modest, as each one represents a significant step forward in various ways, particularly in fueling our drive to enhance this tool continually.

<a href="https://www.buymeacoffee.com/chaibuilder" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>


## Acknowledgments
Chai Builder stands on the shoulders of many open-source libraries and tools. We extend our gratitude to the developers and maintainers of these projects for their contributions.
