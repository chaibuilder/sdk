# Chai Builder - Low-Code Visual Builder

Chai Builder is an Open Source Low Code React + Tailwind CSS Builder to create beautiful content driven websites. The perfect tool for Startups and Indie-Hackers alike.


### Try Chai Builder:

[Demo Link](https://chaibuilder-demo.vercel.app)

Source Code (React App): [GitHub](https://github.com/surajair/demo)


### Usage

> Please ensure `Tailwind CSS` is configured for your project depending on framework. [https://tailwindcss.com/docs/installation](https://tailwindcss.com/docs/installation)

Step 1: Install the package
```bash
npm install @chaibuilder/sdk @chaibuilder/blocks
```

Step 2: Add a custom tailwind config.
Create a new file: `tailwind.chaibuilder.config.ts` and add the following content.
```js
import type { Config } from "tailwindcss";

/**
 * NOTE: This file is only used for the ChaiBuilder UI.
 * Any changes made here will only affect the ChaiBuilder UI and your website will not be affected.
 */
const config: Config = {
  content: [
    "./chai-blocks/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "node_modules/@chaibuilder/sdk/dist/*.{js,cjs}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  // eslint-disable-next-line no-undef
  plugins: [],
};
export default config;

```

Step 3: Create a new `chaibuilder.tailwind.css`
```css
@config "./tailwind.chaibuilder.config.ts";

@tailwind base;
@tailwind components;
@tailwind utilities;
```

Step 4: Add the component on the page.
```tsx
import "./chaibuilder.tailwind.css";
import "@chaibuilder/sdk/styles";
import {ChaiBuilderStudio} from "@chaibuilder/sdk";

const BuilderFullPage = () => {
  return  <ChaiBuilderStudio logo={<h1>Your Logo</h1>} />;
}
```


### Features

- **Visual Editor**: Easily tweak and fine-tune Tailwind CSS settings visually.
- **Customization**: Modify colors, spacing, typography, and more to match your design requirements.
- **Responsive Design**: Test and preview designs across various screen sizes to ensure responsiveness.

### In Progress
- **Live Preview**: See real-time changes in a live preview, enabling quick design decisions.
- **Sub Pages**: Global reusable blocks. Eg: Header, Footer etc

## Acknowledgments

Chai Builder stands on the shoulders of many open-source libraries and tools. We extend our gratitude to the developers and maintainers of these projects for their contributions.
