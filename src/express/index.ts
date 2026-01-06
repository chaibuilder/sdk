import express from "@/express";
import cors from "cors";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import { ChaiBuilderPages } from "../server/classes/class-chaibuilder-pages";
import { ChaiBuilderPagesBackend } from "../server/classes/class-chaibuilder-pages-backend";
import { ChaiAIChatHandler } from "../server/export";
import { registerChaiGlobalDataProvider } from "../server/register/register-global-data-provider";
import { registerChaiPageType } from "../server/register/register-page-type";
import { registerChaiPartialType } from "../server/register/register-partial-type";
import { registerChaiCollection } from "../server/register/regsiter-collection";
import { BLOCKS } from "./blocks";
import "./register";

dotenv.config();

export const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    abortOnLimit: true,
    responseOnLimit: "File size limit has been reached (max: 50MB)",
  }),
);

const apiKey = process.env["CHAI_API_KEY"]!;

const backend = new ChaiBuilderPagesBackend(apiKey);
const aiHandler = new ChaiAIChatHandler({ onFinish: console.log, onError: console.error });
const chaiPages = new ChaiBuilderPages({
  backend,
  ai: aiHandler,
});
// const chaiPages = new ChaiBuilderPages({ backend: new ChaiBuilderPagesBackend(apiKey, "http://localhost:3000") });

type GlobalData = {
  lang: string;
  logo: string;
  title: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  social: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
};

const registerPageTypes = () => {
  // setChaiServerBlockDataProvider("CustomBlock", async () => {
  //   return {
  //     name: "Custom Block",
  //     description: "Custom Block",
  //     keywords: "Custom Block",
  //   };
  // });

  registerChaiPartialType("form", {
    name: "Form",
  });

  registerChaiCollection("blogs", {
    name: "Blogs",
    fetch: async () => {
      return {
        items: [
          {
            id: "1",
            title: "Blog 1",
            content: "Content of blog 1",
            createdAt: "2022-01-01",
            image: "https://picsum.photos/60",
            slug: "blog-1",
          },
          {
            id: "2",
            title: "Blog 2",
            content: "Content of blog 2",
            createdAt: "2022-01-02",
            image: "https://picsum.photos/61",
            slug: "blog-2",
          },
        ],
        totalItems: 12,
      };
    },
    filters: [{ id: "most-viewed", name: "Most viewed" }],
  });

  registerChaiGlobalDataProvider<GlobalData>(async ({ lang, draft, inBuilder }) => ({
    lang,
    draft,
    inBuilder,
    logo: "https://picsum.photos/60",
    title: "Mon site",
    description: "Description de mon site",
    address: "123 Rue de la Paix, 75000 Paris, France",
    phone: "+33 1 23 45 67 89",
    email: "contact@mon-site.com",
    social: {
      facebook: "https://www.facebook.com/mon-site",
      twitter: "https://www.twitter.com/mon-site",
      instagram: "https://www.instagram.com/mon-site",
    },
    social1: {
      facebook: "https://www.facebook.com/mon-site",
      twitter: "https://www.twitter.com/mon-site",
      instagram: "https://www.instagram.com/mon-site",
    },
    social2: {
      facebook: "https://www.facebook.com/mon-site",
      twitter: "https://www.twitter.com/mon-site",
      instagram: "https://www.instagram.com/mon-site",
    },
    social3: {
      facebook: "https://www.facebook.com/mon-site",
      twitter: "https://www.twitter.com/mon-site",
      instagram: "https://www.instagram.com/mon-site",
    },
  }));

  registerChaiPageType("inventory_make_listing", {
    name: "Inventory Make Listing",
    dynamicSegments: "/[a-z]+(/[0-9]+)?",
    dynamicSlug: "[make]",
    dataProvider: async ({ lang, draft, inBuilder }) => ({
      draft,
      inBuilder,
      lang,
      title: "Titre de la nouvelle",
      description: "Description de la nouvelle",
      keywords: "Mots-clés de la nouvelle",
      specifications: [
        {
          name: "Spécification 1",
          value: "Valeur 1",
        },
      ],
    }),
    defaultTrackingInfo: () => ({
      gtm: {
        name: `{{global.name}}`,
        description: `{{global.description}}`,
      },
    }),
  });

  registerChaiPageType("inventory_make_trim_listing", {
    name: "Inventory Trim Listing",
    dynamicSegments: "/[a-z]+(/[0-9]+)?",
    dynamicSlug: "[trim]",
    dataProvider: async ({ lang, draft, inBuilder }) => ({
      draft,
      inBuilder,
      lang,
    }),
    defaultTrackingInfo: () => ({
      gtm: {
        name: `{{global.name}}`,
        description: `{{global.description}}`,
      },
    }),
  });
  registerChaiPageType("vdp_page", {
    name: "Vdp Page",
    dynamicSegments: "/[a-z0-9-]{10,}",
    dynamicSlug: "[slug]",
    dataProvider: async ({ lang, draft, inBuilder }) => ({
      draft,
      inBuilder,
      lang,
    }),
    defaultTrackingInfo: () => ({
      gtm: {
        name: `{{global.name}}`,
        description: `{{global.description}}`,
      },
    }),
  });

  registerChaiPageType("inventory_listing", {
    name: "Inventory Listing",
    icon: `<svg stroke="currentColor"  fill="currentColor" strokeWidth="0" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.526 11.695c1.84-.382 3.367-2.044 3.367-4.478 0-2.604-1.9-4.97-5.615-4.97H0v19.506h10.6c3.75 0 5.683-2.341 5.683-5.292-.009-2.426-1.646-4.444-3.757-4.766zm-8.37-5.793h5.207c1.407 0 2.28.849 2.28 2.044 0 1.255-.881 2.044-2.28 2.044H4.155zM9.54 18.098H4.155v-4.444h5.386c1.61 0 2.484.992 2.484 2.222.009 1.399-.932 2.222-2.484 2.222zM21.396 2.28c-1.255 0-2.315 1.052-2.315 2.307s.882 2.103 1.993 2.103c.238 0 .467-.025.56-.085-.238 1.052-1.315 2.282-2.256 2.782l1.611 1.314C22.796 9.422 24 7.462 24 5.266c0-1.9-1.23-2.985-2.604-2.985Z"></path></svg>`,
    dynamicSegments: "(/[0-9]+)?",
    dynamicSlug: "[listing-slug]",
    dataProvider: async ({ lang, draft, inBuilder }) => ({
      draft,
      inBuilder,
      lang,
      title: "Titre de la nouvelle",
      description: "Description de la nouvelle",
      keywords: "Mots-clés de la nouvelle",
      specifications: [
        {
          name: "Spécification 1",
          value: "Valeur 1",
        },
      ],
    }),
    defaultTrackingInfo: () => ({
      gtm: {
        name: `{{global.name}}`,
        description: `{{global.description}}`,
      },
    }),
  });

  registerChaiPageType("blog", {
    name: "Blog",
    helpText: "A blog post page.",
    dynamicSegments: "/[a-z0-9]+(?:-[a-z0-9]+)*$", // regex for slug. starts with / and should contain only lowercase letters, numbers and hyphens
    dynamicSlug: "{{slug}}",
    dataProvider: async ({ lang, draft, inBuilder, pageProps }) => {
      const { slug } = pageProps;
      const data = {
        draft,
        inBuilder,
        lang,
        title: "Titre de la nouvelle",
        description: "Description de la nouvelle",
        keywords: "Mots-clés de la nouvelle",
        specifications: [
          {
            name: "Spécification 1",
            value: "Valeur 1",
          },
        ],
      };
      if (slug.includes("/blogs/") || slug.includes("/blogue/")) {
        const blogId = slug.split("/")[slug.split("/").length - 1];
        data.title = "Blog " + blogId;
        data.description = "Description de la blog " + blogId;
        data.keywords = "Mots-clés de la blog " + blogId;
      }
      return data;
    },
    getDynamicPages: async ({ query, uuid }) => {
      if (uuid) return [{ id: uuid, name: "Blog 1", slug: "/blog-1", lang: "en" }];
      return [
        { id: "1", name: "Blog 1 " + query, slug: "/blog-1", lang: "en" },
        { id: "2", name: "Blog 2 " + query, slug: "/blog-2", lang: "en" },
        { id: "3", name: "Blog 3 " + query, slug: "/blog-2-fr", lang: "fr", primaryPage: "2" },
      ];
    },
  });

  registerChaiPartialType("form", {
    name: "Form",
    helpText: "A form can be reused in multiple pages.",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash-icon lucide-hash"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>`,
  });
};

registerPageTypes();

app.post("/chai/users", async (req, res) => {
  handleApi(req, res);
});

app.post("/chai/assets", async (req, res) => {
  handleApi(req, res);
});

app.post("/chai/api", async (req, res) => {
  handleApi(req, res);
});

app.get("/chai/api/pages", async (req, res) => {
  const slug = req.query.slug as string;
  chaiPages.setDraftMode(true);
  const page = await chaiPages.getPageBySlug(slug);
  res.json(page);
});

app.get("/chai/api/page-data", async (req, res) => {
  const slug = req.query.slug as string;
  chaiPages.setDraftMode(true);
  const pageData = await chaiPages.getPageData({
    blocks: BLOCKS,
    pageType: "page",
    pageProps: { slug },
    lang: "en",
  });
  res.json(pageData);
});

if (!process.env["VITE"]) {
  const frontendFiles = process.cwd() + "/dist";
  app.use(express.static(frontendFiles));
  app.get("/*", (_, res) => {
    res.send(frontendFiles + "/index.html");
  });
  app.listen(process.env["PORT"]);
}

async function handleApi(req: express.Request, res: express.Response) {
  const authorization = req.headers["authorization"] as string;
  const body = req.body;
  const authToken = authorization ? authorization.split(" ")[1] : "";

  try {
    // Handle AI chat streaming separately
    if (body.action === "ASK_AI") {
      const aiHandler = chaiPages.getAIHandler();

      if (!aiHandler || !aiHandler.isConfigured()) {
        res.status(500).json({ error: "AI is not configured" });
        return;
      }

      await aiHandler.handleRequest(body.data, res);
      return;
    }

    // Handle all other actions normally
    const response = await chaiPages.handle(body, authToken, res);
    if (response.error) {
      res.status(response.status).json({ error: response.error });
    } else {
      res.json(response);
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
