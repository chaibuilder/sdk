/**
 * In Tailwind CSS v4, configuration has moved to CSS files using @config syntax
 * This file is maintained for backward compatibility with existing projects
 * that might be importing or extending this configuration.
 * 
 * See src/index.css for the current configuration implementation.
 */

// Import plugins for backward compatibility
import aspectRatio from "@tailwindcss/aspect-ratio";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import animate from "tailwindcss-animate";

/**
 * Returns shadcn theme object - maintained for backward compatibility
 */
function shadcnTheme() {
  console.warn(
    "[Deprecated] shadcnTheme() is deprecated in Tailwind v4. "
    + "Theme configuration is now defined in CSS using @config. "
    + "See src/index.css for the current implementation."
  );
  
  return {
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
      md: `calc(var(--radius) - 0.125rem)`,
      sm: "calc(var(--radius) - 0.25rem)",
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
  };
}

/**
 * Returns a Tailwind configuration object - maintained for backward compatibility
 */
const getChaiBuilderTailwindConfig = (content: string[]) => {
  console.warn(
    "[Deprecated] getChaiBuilderTailwindConfig() is deprecated in Tailwind v4. "
    + "Configuration is now defined in CSS using @config. "
    + "See src/index.css for the current implementation."
  );
  
  return {
    darkMode: ["class"],
    content: [...content, "node_modules/@chaibuilder/sdk/dist/*.{js,cjs}"],
    theme: {
      extend: shadcnTheme(),
    },
    plugins: [typography, forms, aspectRatio, animate],
  };
};

export { getChaiBuilderTailwindConfig, shadcnTheme };
