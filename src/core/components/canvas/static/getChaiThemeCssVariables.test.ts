import { getChaiThemeCssVariables } from "@/core/components/canvas/static/chai-theme-helpers";
import { ChaiTheme } from "@/types/chaibuilder-editor-props";

describe("getChaiThemeCssVariables", () => {
  it("should handle fontVariables: false without generating font CSS variables", () => {
    const theme: ChaiTheme = {
      fontFamily: {
        heading: "Inter",
        body: "Roboto",
      },
      colors: {
        primary: ["#3b82f6", "#1d4ed8"],
      },
    };

    const result = getChaiThemeCssVariables({ theme, fontVariables: false });
    
    // Should not contain font variables
    expect(result).not.toContain("--font-heading");
    expect(result).not.toContain("--font-body");
    // Should not contain literal 'false' in output
    expect(result).not.toContain("false");
  });

  it("should generate font CSS variables when fontVariables is true", () => {
    const theme: ChaiTheme = {
      fontFamily: {
        heading: "Inter",
        body: "Roboto",
      },
    };

    const result = getChaiThemeCssVariables({ theme, fontVariables: true });
    
    // Should contain font variables
    expect(result).toContain("--font-heading:");
    expect(result).toContain("--font-body:");
  });

  it("should handle missing fontFamily gracefully when fontVariables is true", () => {
    const theme: ChaiTheme = {
      colors: {
        primary: ["#3b82f6", "#1d4ed8"],
      },
    };

    const result = getChaiThemeCssVariables({ theme, fontVariables: true });
    
    // Should not contain font variables
    expect(result).not.toContain("--font-");
    // Should not contain literal 'false' or 'undefined'
    expect(result).not.toContain("false");
    expect(result).not.toContain("undefined");
  });

  it("should handle missing colors without generating literal false/undefined", () => {
    const theme: ChaiTheme = {
      fontFamily: {
        heading: "Inter",
      },
    };

    const result = getChaiThemeCssVariables({ theme, fontVariables: false });
    
    // Should not contain literal 'false' or 'undefined' in CSS
    expect(result).not.toContain("false");
    expect(result).not.toContain("undefined");
  });

  it("should generate light theme color variables in :root", () => {
    const theme: ChaiTheme = {
      colors: {
        primary: ["#3b82f6", "#1d4ed8"],
        secondary: ["#10b981", "#059669"],
      },
    };

    const result = getChaiThemeCssVariables({ theme });
    
    // Should contain color variables in HSL format
    expect(result).toMatch(/--primary:\s*\d+\s+\d+%\s+\d+%;/);
    expect(result).toMatch(/--secondary:\s*\d+\s+\d+%\s+\d+%;/);
    // Primary color #3b82f6 should convert to HSL
    expect(result).toContain("217 91% 60%"); // Light version
  });

  it("should generate dark theme color variables in .dark selector", () => {
    const theme: ChaiTheme = {
      colors: {
        primary: ["#3b82f6", "#1d4ed8"],
      },
    };

    const result = getChaiThemeCssVariables({ theme });
    
    // Should contain .dark selector with dark theme colors
    expect(result).toContain(".dark");
    // Dark primary color #1d4ed8 should be in .dark section
    expect(result).toMatch(/\.dark\s*{[\s\S]*--primary:\s*\d+\s+\d+%\s+\d+%;/);
  });

  it("should handle borderRadius correctly", () => {
    const theme: ChaiTheme = {
      borderRadius: "0.5rem",
    };

    const result = getChaiThemeCssVariables({ theme });
    
    // Should contain border radius variable
    expect(result).toContain("--radius: 0.5rem;");
  });

  it("should generate complete CSS with all theme properties", () => {
    const theme: ChaiTheme = {
      fontFamily: {
        heading: "Inter",
        body: "Roboto",
      },
      borderRadius: "0.5rem",
      colors: {
        primary: ["#3b82f6", "#1d4ed8"],
        secondary: ["#10b981", "#059669"],
      },
    };

    const result = getChaiThemeCssVariables({ theme, fontVariables: true });
    
    // Should start with :root
    expect(result).toMatch(/^:root\s*{/);
    // Should contain font variables
    expect(result).toContain("--font-heading:");
    expect(result).toContain("--font-body:");
    // Should contain border radius
    expect(result).toContain("--radius: 0.5rem;");
    // Should contain light theme colors
    expect(result).toMatch(/--primary:\s*\d+\s+\d+%\s+\d+%;/);
    expect(result).toMatch(/--secondary:\s*\d+\s+\d+%\s+\d+%;/);
    // Should contain .dark selector
    expect(result).toContain(".dark");
    // Should not contain any literal false/undefined
    expect(result).not.toContain("false");
    expect(result).not.toContain("undefined");
  });

  it("should handle empty theme gracefully", () => {
    const theme: ChaiTheme = {};

    const result = getChaiThemeCssVariables({ theme });
    
    // Should still generate valid CSS structure
    expect(result).toContain(":root");
    expect(result).toContain(".dark");
    // Should not contain literal 'false' or 'undefined'
    expect(result).not.toContain("false");
    expect(result).not.toContain("undefined");
  });

  it("should handle partial colors (missing dark theme) gracefully", () => {
    const theme: ChaiTheme = {
      colors: {
        primary: ["#3b82f6", "#1d4ed8"],
      },
    };

    const result = getChaiThemeCssVariables({ theme });
    
    // Should generate both light and dark sections
    expect(result).toContain(":root");
    expect(result).toContain(".dark");
    // Should contain color variables in both sections
    expect(result).toMatch(/--primary:\s*\d+\s+\d+%\s+\d+%;/);
  });
});
