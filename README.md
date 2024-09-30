# Chai Builder - Open Source Tailwind Builder

Chai Builder is an Open Source Low Code React + Tailwind CSS Visual Builder. 
It allows you to create web pages visually by dragging and dropping elements onto the canvas. 
It is a simple React component that renders a full-fledged visual builder into any React application. 

#### [View Demo](https://chaibuilder.com/demos/web)
#### [Documentation](https://chaibuilder.com/docs/sdk/introduction)
#### [API References](https://api-reference.chaibuilder.com)

---

### Manual installation:

Step 1: Install the packages
```bash
npm install @chaibuilder/sdk @chaibuilder/runtime tailwindcss
```

Step 2: Add a custom tailwind config.
Create a new file: `tailwind.chaibuilder.config.ts`. <br /> Pass the path to your source files.
```tsx
import { getChaiBuilderTailwindConfig } from "@chaibuilder/sdk/tailwind";
export default getChaiBuilderTailwindConfig(["./src/**/*.{js,ts,jsx,tsx}"]);

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
import {loadWebBlocks} from "@chaibuilder/sdk/web-blocks";
import { ChaiBuilderEditor } from "@chaibuilder/sdk";

loadWebBlocks();

const BuilderFullPage = () => {
  return  (
      <ChaiBuilderEditor
          blocks={[{_type: 'Heading', _id: 'a', content: 'This is a heading', styles: '#styles:,text-3xl font-bold'}]}
          onSave={async ({ blocks, providers, brandingOptions } ) => {
            console.log(blocks, providers, brandingOptions );
            return true
          }}
      />
  );
}
```
    
### Render the blocks on your page.

```tsx
export default () => {
    return <RenderChaiBlocks blocks={blocks}/>
}
```

---
## Support
If you like the project, you can assist us in expanding. ChaiBuilder is a collaborative endeavor crafted by developers in their free time. We value every contribution, no matter how modest, as each one represents a significant step forward in various ways, particularly in fueling our drive to enhance this tool continually.

<a href="https://www.buymeacoffee.com/chaibuilder" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>


## Acknowledgments
Chai Builder stands on the shoulders of many open-source libraries and tools. We extend our gratitude to the developers and maintainers of these projects for their contributions.
