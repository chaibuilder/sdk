// In Tailwind v4, plugins need to be imported differently
import aspectRatio from "@tailwindcss/aspect-ratio";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import animate from "tailwindcss-animate";

function shadcnTheme() {
  return {
    // In Tailwind v4, the color configuration works similarly, but we may need to
    // use more CSS variables for better integration with the new version
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
    // Tailwind v4 uses rem by default for border-radius
    borderRadius: {
      lg: `var(--radius)`,
      md: `calc(var(--radius) - 0.125rem)`,
      sm: "calc(var(--radius) - 0.25rem)",
    },
    // Keyframes work similarly in v4
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
    // Animation configuration remains similar
    animation: {
      "accordion-down": "accordion-down 0.2s ease-out",
      "accordion-up": "accordion-up 0.2s ease-out",
    },
  };
}

const getChaiBuilderTailwindConfig = (content: string[]) => {
  return {
    // Tailwind v4 uses light/dark modes by default rather than class
    darkMode: ["class"],
    content: [...content, "node_modules/@chaibuilder/sdk/dist/*.{js,cjs}"],
    theme: {
      extend: shadcnTheme(),
    },
    // In Tailwind v4, plugins are imported directly
    plugins: [animate, typography, forms, aspectRatio],
  };
};

export { getChaiBuilderTailwindConfig };
