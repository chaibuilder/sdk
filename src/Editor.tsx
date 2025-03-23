import axios from "axios";
import { useAtom } from "jotai";
import { isArray, map, pick, values } from "lodash-es";
import { Info } from "lucide-react";
import { useState } from "react";
import { lsAiContextAtom, lsBlocksAtom, lsThemeAtom } from "./__dev/atoms-dev.ts";
import registerCustomBlocks from "./__dev/blocks/index.tsx";
import GalleryWidget from "./__dev/CustomWidget.tsx";
import { LanguageButton } from "./__dev/LangButton.tsx";
import PreviewWeb from "./__dev/preview/WebPreview.tsx";
import RightTop from "./__dev/RightTop.tsx";
import { bluePreset, greenPreset, orangePreset } from "./__dev/THEME_PRESETS.ts";
import { ChaiBlock, ChaiBuilderEditor, getBlocksFromHTML, PERMISSIONS } from "./core/main";
import { SavePageData } from "./core/types/chaiBuilderEditorProps.ts";
import { Alert, AlertDescription } from "./ui/shadcn/components/ui/alert.tsx";
import { DropdownMenuItem } from "./ui/shadcn/components/ui/dropdown-menu.tsx";
import { loadWebBlocks } from "./web-blocks";

loadWebBlocks();
registerCustomBlocks();

const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <a href="https://chaibuilder.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
        <img src="/chaibuilder-logo.png" alt="Chai Builder" width={32} height={32} className="rounded-md" />
        <span className="text-2xl font-bold tracking-tight">Chai Builder</span>
      </a>

      <a href="https://github.com/chaibuilder/sdk" target="_blank" rel="noopener noreferrer">
        <img src="https://img.shields.io/github/stars/chaibuilder/sdk" alt="Chai Builder" className="rounded-md" />
      </a>
    </div>
  );
};

const DemoAlert = () => {
  return (
    <Alert variant="default" className="px-4 py-2">
      <AlertDescription className="flex items-center gap-2">
        <Info className="h-4 w-4" />
        <span className="font-bold">Demo mode</span> - Changes are saved in your browser local storage. AI actions are
        mocked.
      </AlertDescription>
    </Alert>
  );
};

const MediaManagerComponent = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-full items-center justify-center pt-20">Implement your media manager here</div>
    </div>
  );
};

const SaveToLibrary = ({ block }: { block: ChaiBlock }) => {
  return (
    <DropdownMenuItem className="cursor-pointer text-xs" onClick={() => console.log(block)}>
      Save to library
    </DropdownMenuItem>
  );
};

function ChaiBuilderDefault() {
  const [blocks] = useAtom(lsBlocksAtom);
  const [theme, setTheme] = useAtom(lsThemeAtom);

  const [aiContext, setAiContext] = useAtom(lsAiContextAtom);
  const [uiLibraries] = useState([
    { uuid: "meraki-ui", name: "Meraki UI", url: "https://chai-ui-blocks.vercel.app" },
    { uuid: "chaiblocks", name: "UI Blocks", url: "https://chaibuilder.com/chaiblocks" },
  ]);

  return (
    <ChaiBuilderEditor
      permissions={[...values(PERMISSIONS)]}
      // permissions={[]}
      blockMoreOptions={[SaveToLibrary]}
      mediaManagerComponent={MediaManagerComponent}
      pageExternalData={{
        vehicle: {
          title: "Hyundai i20 Active - 1.0 MPI - 2015",
          description:
            "Hyundai i20 Active - 1.0 MPI - 2015, 100000km, Petrol, Manual, 5 doors, 5 seats. This is a description of my vehicle. It is a car.",
          price: "$2000",
          image: "https://picsum.photos/400/200",
          link: "https://www.google.com",
        },
        global: {
          siteName: "My Site",
          twitterHandle: "@my-twitter-handle",
          description: "This is a description of my page",
        },
      }}
      rjsfWidgets={{ gallery: GalleryWidget }}
      fallbackLang="en"
      languages={["fr"]}
      themePresets={[{ orange: orangePreset }, { green: greenPreset }, { blue: bluePreset }]}
      theme={theme}
      autoSaveSupport={true}
      autoSaveInterval={15}
      previewComponent={PreviewWeb}
      blocks={blocks}
      onSave={async ({ blocks, theme }: SavePageData) => {
        console.log("onSave", blocks, theme);
        localStorage.setItem("chai-builder-blocks", JSON.stringify(blocks));
        localStorage.setItem("chai-builder-theme", JSON.stringify(theme));
        setTheme(theme);
        await new Promise((resolve) => setTimeout(resolve, 100));
        return true;
      }}
      saveAiContextCallback={async (aiContext: string) => {
        setAiContext(aiContext);
        return true;
      }}
      aiContext={aiContext}
      askAiCallBack={async (type: "styles" | "content", prompt: string, blocks: ChaiBlock[], lang: string = "") => {
        console.log("askAiCallBack", type, prompt, blocks, lang);
        return {
          blocks: map(blocks, (b) => ({
            ...pick(b, ["_id"]),
          })),
          usage: { completionTokens: 151, promptTokens: 227, totalTokens: 378 },
        };
      }}
      getUILibraryBlock={async (uiLibrary, uiLibBlock) => {
        const response = await axios.get(
          uiLibrary.url + (!uiLibBlock.path ? "/" + uiLibBlock.uuid + ".html" : "/blocks/" + uiLibBlock.path),
        );
        const html = await response.data;
        const htmlWithoutChaiStudio = html.replace(/---([\s\S]*?)---/g, "");
        return getBlocksFromHTML(`${htmlWithoutChaiStudio}`) as ChaiBlock[];
      }}
      getUILibraryBlocks={async (uiLibrary) => {
        try {
          const response = await axios.get(uiLibrary.url + "/blocks.json");
          const blocks = await response.data;
          return blocks.map((b) => ({ ...b, preview: uiLibrary.url.replace("chaiblocks", "") + b.preview }));
        } catch (error) {
          return [];
        }
      }}
      uiLibraries={uiLibraries}
      topBarComponents={{ left: [Logo], center: [DemoAlert], right: [LanguageButton, RightTop] }}
      getPartialBlockBlocks={async (partialBlockKey: string) => {
        const blocks =
          partialBlockKey === "partial"
            ? [
                {
                  _type: "Box",
                  _id: "header",
                  tag: "div",
                  styles: "#styles:,flex flex-col items-center justify-center h-96",
                },
                {
                  _type: "Span",
                  content: "Span 2",
                  _id: "span",
                  _parent: "header",
                  styles: "#styles:,text-center text-3xl font-bold p-4 bg-gray-100",
                },
                {
                  _type: "Heading",
                  content: "Heading 1",
                  _id: "heading",
                  _parent: "header",
                  styles: "#styles:,text-center text-3xl font-bold p-4 bg-gray-100",
                },
              ]
            : [
                {
                  styles:
                    "#styles:,flex w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800",
                  tag: "div",
                  backgroundImage: "",
                  _type: "Box",
                  _id: "rnqzul",
                  _name: "Box",
                },
              ];
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
    />
  );
}

export default ChaiBuilderDefault;
