/**
 * In Tailwind CSS v4, configuration is moved directly to CSS files
 * This file is kept for backward compatibility but is no longer the primary config source.
 * 
 * See src/index.css for the full configuration using the new @config approach
 */

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
    "node_modules/@chaibuilder/sdk/dist/*.{js,cjs}"
  ],
  // Enable safelist to prevent purging of important: prefix classes
  safelist: [
    { pattern: /^important:/, variants: ['sm', 'md', 'lg', 'xl', '2xl'] }
  ],
  // Tailwind configuration matches what was moved to CSS
  // See src/index.css for the complete configuration
  // This is kept for backward compatibility with external projects that import this config
  __legacy: true, // marker to indicate this is used alongside CSS-based config
}
