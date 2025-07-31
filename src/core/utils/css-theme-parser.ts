import { ChaiThemeValues } from "@/types/chaibuilder-editor-props";

/**
 * Parses CSS input and converts it to ChaiThemeValues format
 */
export const parseToChaiThemeValues = (cssInput: string): ChaiThemeValues => {
  const result: ChaiThemeValues = {
    fontFamily: {
      heading: "",
      body: "",
    },
    borderRadius: "",
    colors: {} as any,
  };

  try {
    const lightColors = extractCssBlockContent(cssInput, ":root");
    const darkColors = extractCssBlockContent(cssInput, ".dark");

    // Parse font families
    const fontSans = extractVariableValue(lightColors, "--font-sans") || 
                    extractVariableValue(lightColors, "--font-family") ||
                    extractVariableValue(lightColors, "--font-heading") ||
                    extractVariableValue(lightColors, "--font-body");
    
    result.fontFamily = {
      heading: fontSans || "ui-sans-serif, system-ui, sans-serif",
      body: fontSans || "ui-sans-serif, system-ui, sans-serif",
    };

    // Parse border radius
    result.borderRadius = extractVariableValue(lightColors, "--radius") || 
                         extractVariableValue(lightColors, "--border-radius") || 
                         "0.5rem";

    // Define color mappings
    const colorMappings = [
      "background",
      "foreground", 
      "primary",
      "primary-foreground",
      "secondary",
      "secondary-foreground",
      "muted",
      "muted-foreground",
      "accent",
      "accent-foreground",
      "destructive",
      "destructive-foreground",
      "border",
      "input",
      "ring",
      "card",
      "card-foreground",
      "popover",
      "popover-foreground",
    ];

    // Parse colors
    colorMappings.forEach(colorName => {
      const lightValue = extractVariableValue(lightColors, `--${colorName}`);
      const darkValue = extractVariableValue(darkColors, `--${colorName}`);

      if (lightValue || darkValue) {
        const lightColor = lightValue ? processAndFormatColor(lightValue) : "#000000";
        const darkColor = darkValue ? processAndFormatColor(darkValue) : lightColor;
        
        result.colors[colorName as keyof typeof result.colors] = [lightColor, darkColor];
      }
    });

  } catch (error) {
    console.error("Error parsing CSS to ChaiThemeValues:", error);
  }

  return result;
};

/**
 * Helper function to extract CSS block content
 */
const extractCssBlockContent = (input: string, selector: string): string | null => {
  const regex = new RegExp(`${escapeRegExp(selector)}\\s*{([^}]+)}`);
  return input.match(regex)?.[1]?.trim() || null;
};

/**
 * Helper function to extract variable value
 */
const extractVariableValue = (cssContent: string | null, variableName: string): string | null => {
  if (!cssContent) return null;
  
  const regex = new RegExp(`${escapeRegExp(variableName)}\\s*:\\s*([^;]+)`);
  const match = cssContent.match(regex);
  return match?.[1]?.trim() || null;
};

/**
 * Helper function to process and format color values
 */
const processAndFormatColor = (value: string): string => {
  try {
    // Remove any var() references and clean the value
    let cleanValue = value.replace(/var\([^)]+\)/g, '').trim();
    
    // Handle HSL values that might be missing hsl() wrapper
    if (/^\d/.test(cleanValue) && !cleanValue.startsWith('#') && !cleanValue.startsWith('rgb') && !cleanValue.startsWith('hsl')) {
      cleanValue = `hsl(${cleanValue})`;
    }
    
    // Convert to hex if it's a valid color
    if (cleanValue.startsWith('#') && /^#[0-9A-F]{6}$/i.test(cleanValue)) {
      return cleanValue;
    }
    
    // Convert HSL to hex
    if (cleanValue.startsWith('hsl(')) {
      return hslToHex(cleanValue);
    }
    
    // Convert RGB to hex
    if (cleanValue.startsWith('rgb(')) {
      return rgbToHex(cleanValue);
    }
    
    // If it's already a hex color or valid CSS color, return as-is
    return cleanValue.startsWith('#') ? cleanValue : `#${cleanValue}`;
  } catch (error) {
    console.error("Error processing color value:", value, error);
    return value.startsWith('#') ? value : '#000000'; // Return fallback color
  }
};

/**
 * Convert HSL to Hex
 */
const hslToHex = (hsl: string): string => {
  const match = hsl.match(/hsl\((\d+),?\s*(\d+)%?,?\s*(\d+)%?\)/);
  if (!match) return '#000000';
  
  const h = parseInt(match[1]) / 360;
  const s = parseInt(match[2]) / 100;
  const l = parseInt(match[3]) / 100;
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Convert RGB to Hex
 */
const rgbToHex = (rgb: string): string => {
  const match = rgb.match(/rgb\((\d+),?\s*(\d+),?\s*(\d+)\)/);
  if (!match) return '#000000';
  
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  
  const toHex = (c: number) => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Helper function to escape regex special characters
 */
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Additional utility function to validate the parsed result
 */
export const validateChaiThemeValues = (theme: ChaiThemeValues): boolean => {
  const requiredColorKeys = [
    "background", "foreground", "primary", "primary-foreground"
  ];
  
  const hasRequiredColors = requiredColorKeys.every(key => 
    theme.colors[key as keyof typeof theme.colors] && 
    Array.isArray(theme.colors[key as keyof typeof theme.colors]) &&
    theme.colors[key as keyof typeof theme.colors].length >= 2
  );
  
  return hasRequiredColors && 
         !!theme.fontFamily.heading && 
         !!theme.fontFamily.body && 
         !!theme.borderRadius;
};

/**
 * Basic CSS validation function
 */
export const validateCssInput = (cssText: string): { isValid: boolean; error?: string } => {
  if (!cssText.trim()) {
    return { isValid: false, error: "Please enter CSS content" };
  }

  try {
    // Check if the CSS contains some expected variable definitions
    if (!cssText.includes("--") || !cssText.includes(":")) {
      return {
        isValid: false,
        error: "Invalid CSS format. CSS should contain variable definitions like --primary: #color"
      };
    }

    // Check for basic CSS structure
    if (!cssText.includes("{") || !cssText.includes("}")) {
      return {
        isValid: false,
        error: "Invalid CSS format. CSS should contain proper block structure with { }"
      };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: "Failed to parse CSS. Please check your syntax." };
  }
};
