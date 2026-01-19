# Chai Builder - Open Source React Website Builder

[![npm version](https://img.shields.io/npm/v/@chaibuilder/sdk.svg)](https://www.npmjs.com/package/@chaibuilder/sdk)
[![License](https://img.shields.io/npm/l/@chaibuilder/sdk.svg)](https://github.com/chaibuilder/chaibuilder-sdk/blob/main/LICENSE)

Chai Builder is a **full open-source React website builder** that empowers developers to create stunning web pages visually using drag-and-drop functionality. Built with React and Tailwind CSS, it seamlessly integrates into your existing projects.

✨ **Latest Version:** `4.0.0-beta.8`

🚀 **Out-of-the-box support for:**

- **Next.js 16**
- **Tailwind CSS v3+**

📚 **[Documentation](https://docs.chaibuilder.com/)** | 🎨 **[Live Demo](https://chaibuilder-sdk.vercel.app/)**

![CHAI BUILDER](https://fldwljgzcktqnysdkxnn.supabase.co/storage/v1/object/public/dam-assets/assets/chai-builder.jpg)

## ✨ Features

- 🎨 **Visual Drag & Drop Builder** - Create pages visually without writing code
- ⚛️ **React-First** - Built as a React component for seamless integration
- 🎯 **Tailwind CSS Powered** - Leverage the full power of Tailwind CSS v3+
- 🚀 **Next.js 16 Ready** - Full support for the latest Next.js features
- 🔧 **Two Flexible Modes** - Use as a core builder component or as a complete Next.js website builder
- 📦 **Extensible** - Add custom blocks and components
- 💾 **Data Control** - Full control over how and where you save your data
- 🎭 **Framework Agnostic Rendering** - Render blocks in any React application

---

## 📦 Packages

Chai Builder is available in two packages:

- **`@chaibuilder/sdk`** - Core builder for any React application
- **`@chaibuilder/next`** - Next.js-specific implementation with SSG + ISR

---

## 🚀 Getting Started

Chai Builder offers two modes to fit your needs:

### 1️⃣ Core Builder Mode

Integrate the builder as a standard React component into any React application using **`@chaibuilder/sdk`**.

### 2️⃣ Next.js Website Builder

**Ideal for public content-heavy sites** - Perfect for blogs, marketing sites, documentation, and any public-facing content. Uses **`@chaibuilder/next`** with **SSG (Static Site Generation) + ISR (Incremental Static Regeneration)** for optimal performance and SEO.

Get started quickly with our Next.js starter template (Work in Progress):

👉 **[Next.js + Supabase Starter](https://github.com/chaibuilder/chaibuilder-next-supabase-starter)**

---

## 📦 Installation

### Core Builder Mode (`@chaibuilder/sdk`)

#### Step 1: Install the package

```bash
npm install @chaibuilder/sdk@4.0.0-beta.8
# or
pnpm add @chaibuilder/sdk@4.0.0-beta.8
# or
yarn add @chaibuilder/sdk@4.0.0-beta.8
```

#### Step 2: Configure Tailwind CSS

Create a custom Tailwind config file: `tailwind.chaibuilder.config.ts`

```tsx
import { getChaiBuilderTailwindConfig } from "@chaibuilder/sdk/tailwind";
export default getChaiBuilderTailwindConfig(["./src/**/*.{js,ts,jsx,tsx}"]);
```

#### Step 3: Create Chai Builder CSS file

Create `chaibuilder.tailwind.css`:

```css
@config "./tailwind.chaibuilder.config.ts";

@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### Step 4: Add the builder to your page

```tsx
import "./chaibuilder.tailwind.css";
import "@chaibuilder/sdk/styles";
import { loadWebBlocks } from "@chaibuilder/sdk/web-blocks";
import { ChaiBuilderEditor } from "@/core/main";

loadWebBlocks();

const BuilderFullPage = () => {
  return (
    <ChaiBuilderEditor
      blocks={[{ _type: "Heading", _id: "a", content: "This is a heading", styles: "#styles:,text-3xl font-bold" }]}
      onSave={async ({ blocks, providers, brandingOptions }) => {
        console.log(blocks, providers, brandingOptions);
        return true;
      }}
    />
  );
};
```

#### Step 5: Render blocks on your page

Once you've saved blocks, render them anywhere in your application:

```tsx
import { RenderChaiBlocks } from "@chaibuilder/sdk";

export default function Page() {
  // blocks from your database or state
  const blocks = [
    /* your saved blocks */
  ];

  return <RenderChaiBlocks blocks={blocks} />;
}
```

---

## 🎯 Use Cases

- **Landing Pages** - Build beautiful landing pages with ease
- **Marketing Websites** - Create and update marketing content visually
- **Content Management** - Empower non-technical users to create pages
- **Rapid Prototyping** - Quickly prototype and iterate on designs
- **White-Label Solutions** - Build page builders into your SaaS products

---

## 🤝 Support

If you like the project, you can assist us in expanding. ChaiBuilder is a collaborative endeavor crafted by developers in their free time. We value every contribution, no matter how modest, as each one represents a significant step forward in various ways, particularly in fueling our drive to enhance this tool continually.

<a href="https://www.buymeacoffee.com/chaibuilder" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 25px !important;width: 117px !important;" ></a>

## Acknowledgments

Chai Builder stands on the shoulders of many open-source libraries and tools. We extend our gratitude to the developers and maintainers of these projects for their contributions.
