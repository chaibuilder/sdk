import { lsBlocksAtom, lsThemeAtom } from "@/_demo/atoms-dev";
import { defaultShadcnPreset } from "@/_demo/THEME_PRESETS";
import { ChaiBlock, ChaiBuilderEditor } from "@/core/main";
import "@/index.css";
import { SavePageData } from "@/types/chaibuilder-editor-props";
import { loadWebBlocks } from "@/web-blocks";
import { useAtom } from "jotai";
import { isArray } from "lodash-es";
import { EXTERNAL_DATA } from "./_demo/EXTERNAL_DATA";
import { PARTIALS } from "./_demo/PARTIALS";
import Topbar from "./_demo/top-bar";
import { registerChaiTopBar } from "./core/main";

loadWebBlocks();
registerChaiTopBar(Topbar);

function ChaiBuilderDefault() {
  const [blocks] = useAtom(lsBlocksAtom);
  const [theme, setTheme] = useAtom(lsThemeAtom);
  return (
    <ChaiBuilderEditor
      designTokens={{
        ["btn"]: {
          name: "Button",
          value:
            "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        },
        ["btn-primary"]: {
          name: "Button-Primary",
          value: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        },
        ["btn-secondary"]: {
          name: "Button-Secondary",
          value: "bg-secondary text-secondary-foreground shadow hover:bg-secondary/90",
        },
        ["btn-destructive"]: {
          name: "Button-Destructive",
          value: "bg-destructive text-destructive-foreground shadow hover:bg-destructive/90",
        },
        ["btn-outline"]: {
          name: "Button-Outline",
          value: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        },
        ["btn-ghost"]: {
          name: "Button-Ghost",
          value: "hover:bg-accent hover:text-accent-foreground",
        },
        ["btn-link"]: {
          name: "Button-Link",
          value: "text-primary underline-offset-4 hover:underline",
        },
        ["card"]: {
          name: "Card",
          value: "rounded-xl border bg-card text-card-foreground shadow",
        },
        ["heading-1"]: {
          name: "Heading-1",
          value: "text-3xl font-bold tracking-tighter xl:text-4xl 2xl:text-5xl",
        },
        ["heading-2"]: {
          name: "Heading-2",
          value: "text-2xl font-bold tracking-tighter xl:text-3xl 2xl:text-4xl",
        },
        ["heading-3"]: {
          name: "Heading-3",
          value: "text-xl font-bold tracking-tighter xl:text-2xl 2xl:text-3xl",
        },
        ["heading-4"]: {
          name: "Heading-4",
          value: "text-lg font-bold tracking-tighter xl:text-xl 2xl:text-2xl",
        },
        ["heading-5"]: {
          name: "Heading-5",
          value: "text-base font-bold tracking-tighter xl:text-lg 2xl:text-xl",
        },
        ["heading-6"]: {
          name: "Heading-6",
          value: "text-sm font-bold tracking-tighter xl:text-base 2xl:text-lg",
        },
      }}
      flags={{
        librarySite: false,
        copyPaste: true,
        darkMode: false,
        exportCode: true,
        // dataBinding: false,
        importHtml: true,
        importTheme: false,
        dragAndDrop: true,
        designTokens: true,
      }}
      gotoPage={(args) => {
        console.log("gotoPage", args);
      }}
      permissions={null}
      // permissions={[]}
      pageExternalData={EXTERNAL_DATA}
      fallbackLang="en"
      languages={["fr"]}
      themePresets={[{ shadcn_default: defaultShadcnPreset }]}
      theme={theme}
      autoSave={true}
      autoSaveInterval={15}
      blocks={blocks}
      onSave={async ({ blocks, theme, needTranslations }: SavePageData) => {
        console.log("onSave", blocks, theme, needTranslations);
        localStorage.setItem("chai-builder-blocks", JSON.stringify(blocks));
        localStorage.setItem("chai-builder-theme", JSON.stringify(theme));
        setTheme(theme);
        await new Promise((resolve) => setTimeout(resolve, 100));
        return true;
      }}
      getPartialBlockBlocks={async (partialBlockKey: string) => {
        const blocks = PARTIALS[partialBlockKey] ?? PARTIALS["header"];
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(blocks);
          }, 100);
        });
      }}
      getPartialBlocks={async () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              header: {
                type: "GlobalBlock",
                name: "Header",
                description: "Header",
              },
              footer: {
                type: "GlobalBlock",
                name: "Footer",
                description: "Footer",
              },
              partial: {
                type: "PartialBlock",
                name: "Partial Name here",
                description: "Partial",
              },
            });
          }, 1000);
        });
      }}
      pageTypes={[{ key: "page", name: "Pages" }]}
      searchPageTypeItems={async (pageTypeKey: string, query: string | string[]) => {
        console.log("searchPageTypeItems", pageTypeKey, query, "query");
        if (pageTypeKey === "page") {
          const items = [
            { id: "uuid-1", name: "Page 1", slug: "/page-1" },
            { id: "uuid-2", name: "Page 2" },
            { id: "uuid-3", name: "About", slug: "/about" },
            { id: "uuid-4", name: "Contact" },
          ];
          await new Promise((r) => setTimeout(r, 500));
          return items.filter((item) => {
            if (isArray(query)) return query?.includes(item.id);
            return item.name.toLowerCase().includes(query.toString().toLowerCase());
          });
        }
        return [];
      }}
      getBlockAsyncProps={async (args: { block: ChaiBlock }) => {
        console.log("getBlockAsyncProps", args);
        return new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                items: Array.from({ length: 30 }, (_, i) => ({
                  name: `Promotion ${i + 1}`,
                  date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                  image: `https://picsum.photos/500/300`,
                })),
                totalItems: 30,
              }),
            2000,
          ),
        );
      }}
      collections={[
        {
          id: "promotions",
          name: "Promotions",
          description: "Promotions",
          filters: [
            {
              id: "filter-1",
              name: "Promotions Filter 1",
              description: "Promotions Filter 1",
            },
          ],
          sorts: [
            {
              id: "sort-1",
              name: "Promotions Sort 1",
              description: "Promotions Sort 1",
            },
          ],
        },
        {
          id: "vehicles",
          name: "Vehicles",
          description: "Vehicles",
          filters: [
            {
              id: "filter-1",
              name: "Vehicles Filter 1",
              description: "Vehicles Filter 1",
            },
          ],
          sorts: [
            {
              id: "sort-1",
              name: "Vehicles Sort 1",
              description: "Vehicles Sort 1",
            },
          ],
        },
      ]}
    />
  );
}

export default ChaiBuilderDefault;
