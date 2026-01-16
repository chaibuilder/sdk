import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  date,
  doublePrecision,
  foreignKey,
  json,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const getTableName = (name: string): string => {
  const prefix = process.env.CHAIBUILDER_TABLE_PREFIX || "";
  return `${prefix}${name}`;
};

export const libraryTemplates = pgTable(
  getTableName("library_templates"),
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    user: text(),
    name: text(),
    description: text(),
    pageId: uuid(),
    pageType: text(),
    library: uuid(),
    preview: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.library],
      foreignColumns: [libraries.id],
      name: getTableName("library_templates_library_fkey"),
    }),
  ],
);

export const webhookEvents = pgTable(
  getTableName("webhook_events"),
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" })
      .primaryKey()
      .generatedByDefaultAsIdentity({
        name: getTableName("webhook_events_id_seq"),
        startWith: 1,
        increment: 1,
        minValue: 1,
        cache: 1,
      }),
    createdAt: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    provider: text(),
    eventType: text(),
    payload: jsonb(),
    userId: text(),
    clientId: uuid(),
  },
  (table) => [
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [clients.id],
      name: getTableName("webhook_events_clientId_fkey"),
    }),
  ],
);

export const appUsers = pgTable(
  getTableName("app_users"),
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    user: text(),
    app: uuid(),
    role: varchar().default("editor"),
    permissions: jsonb(),
    status: text().default("active").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.app],
      foreignColumns: [apps.id],
      name: getTableName("app_users_app_fkey"),
    }),
  ],
);

export const appDomains = pgTable(
  getTableName("app_domains"),
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    app: uuid(),
    hosting: text().default("vercel"),
    hostingProjectId: text().default("env"),
    subdomain: text(),
    domain: text(),
    domainConfigured: boolean().default(false),
  },
  (table) => [
    foreignKey({
      columns: [table.app],
      foreignColumns: [apps.id],
      name: getTableName("app_domains_app_fkey"),
    }),
  ],
);

export const appPagesRevisions = pgTable(
  getTableName("app_pages_revisions"),
  {
    createdAt: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    slug: text().notNull(),
    lang: text().default("").notNull(),
    seo: jsonb().default({}),
    app: uuid().notNull(),
    buildTime: boolean().default(false),
    id: uuid().notNull(),
    name: text().notNull(),
    primaryPage: uuid(),
    blocks: jsonb().default([]),
    currentEditor: text(),
    changes: jsonb(),
    collection: text().default("page"),
    partialBlocks: text(),
    links: text(),
    online: boolean().default(true),
    pageType: text(),
    parent: uuid(),
    lastSaved: timestamp({ withTimezone: true, mode: "string" }),
    dynamic: boolean().default(false),
    uid: uuid().defaultRandom().primaryKey().notNull(),
    type: varchar().default("published"),
    libRefId: uuid(),
    dynamicSlugCustom: varchar().default(""),
    metadata: jsonb().default({}),
    tracking: jsonb().default({}),
    jsonld: jsonb().default({}),
    globalJsonLds: jsonb().default([]),
    designTokens: jsonb(),
  },
  (table) => [
    foreignKey({
      columns: [table.app],
      foreignColumns: [apps.id],
      name: getTableName("app_pages_revisions_app_fkey"),
    }),
  ],
);

export const clients = pgTable(getTableName("clients"), {
  id: uuid().defaultRandom().primaryKey().notNull(),
  createdAt: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
  name: text(),
  status: text().default("active"),
  billingStartDate: date(),
  startDate: date(),
  settings: jsonb().default({}),
  loginHtml: text(),
  features: jsonb().default({}),
  paymentConfig: jsonb().default({}),
  theme: text(),
  helpHtml: text(),
  madeWithBadge: text(),
});

export const appsOnline = pgTable(
  getTableName("apps_online"),
  {
    id: uuid().primaryKey().notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    name: varchar(),
    user: text(),
    settings: jsonb().default({}),
    theme: jsonb().default({}),
    fallbackLang: text().default("en"),
    languages: jsonb().default([]),
    changes: jsonb(),
    configData: jsonb(),
    apiKey: text(),
    deletedAt: timestamp({ withTimezone: true, mode: "string" }),
    client: uuid(),
    designTokens: jsonb().default({}),
  },
  (table) => [
    foreignKey({
      columns: [table.client],
      foreignColumns: [clients.id],
      name: getTableName("apps_online_client_fkey"),
    }),
  ],
);

export const aiLogs = pgTable(
  getTableName("ai_logs"),
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" })
      .primaryKey()
      .generatedByDefaultAsIdentity({
        name: getTableName("ai_logs_id_seq"),
        startWith: 1,
        increment: 1,
        minValue: 1,
        cache: 1,
      }),
    createdAt: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    model: text(),
    totalDuration: numeric(),
    app: uuid().notNull(),
    error: text(),
    totalTokens: numeric(),
    tokenUsage: jsonb(),
    user: text(),
    client: varchar(),
    cost: doublePrecision().default(sql`'0'`),
    prompt: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.app],
      foreignColumns: [apps.id],
      name: getTableName("app_pages_app_fkey"),
    }),
  ],
);

export const appApiKeys = pgTable(
  getTableName("app_api_keys"),
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    apiKey: text().default(""),
    app: uuid(),
    status: text().default("ACTIVE"),
  },
  (table) => [
    foreignKey({
      columns: [table.app],
      foreignColumns: [apps.id],
      name: getTableName("app_api_keys_app_fkey"),
    }),
  ],
);

export const libraries = pgTable(
  getTableName("libraries"),
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    name: varchar(),
    app: uuid(),
    type: varchar(),
    status: text().default("active").notNull(),
    client: uuid(),
  },
  (table) => [
    foreignKey({
      columns: [table.app],
      foreignColumns: [apps.id],
      name: getTableName("libraries_app_fkey"),
    }),
    foreignKey({
      columns: [table.client],
      foreignColumns: [clients.id],
      name: getTableName("libraries_client_fkey"),
    }),
  ],
);

export const apps = pgTable(
  getTableName("apps"),
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    name: varchar(),
    user: text(),
    settings: jsonb().default({}),
    theme: jsonb().default({}),
    fallbackLang: text().default("en"),
    languages: jsonb().default([]),
    changes: jsonb(),
    configData: jsonb(),
    deletedAt: timestamp({ withTimezone: true, mode: "string" }),
    client: uuid(),
    designTokens: jsonb().default({}),
  },
  (table) => [
    foreignKey({
      columns: [table.client],
      foreignColumns: [clients.id],
      name: getTableName("apps_client_fkey"),
    }),
  ],
);

export const libraryItems = pgTable(
  getTableName("library_items"),
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    library: uuid(),
    name: text(),
    description: text(),
    blocks: jsonb().default([]),
    preview: text(),
    group: text().default("general"),
    user: text(),
    html: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.library],
      foreignColumns: [libraries.id],
      name: getTableName("library_items_library_fkey"),
    }),
  ],
);

export const appAssets = pgTable(
  getTableName("app_assets"),
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    app: uuid(),
    name: text(),
    description: text(),
    url: text(),
    size: text(),
    folderId: text(),
    thumbnailUrl: text(),
    duration: numeric(),
    format: text(),
    width: numeric(),
    height: numeric(),
    createdBy: text(),
    createdAt: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    type: text(),
    updatedAt: timestamp({ withTimezone: true, mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.app],
      foreignColumns: [apps.id],
      name: getTableName("app_assets_app_fkey"),
    }),
  ],
);

export const appFormSubmissions = pgTable(
  getTableName("app_form_submissions"),
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    app: uuid(),
    formData: json(),
    additionalData: json(),
    formName: text().default(""),
    pageUrl: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.app],
      foreignColumns: [apps.id],
      name: getTableName("app_form_submissions_app_fkey"),
    }),
  ],
);

export const appPagesOnline = pgTable(
  getTableName("app_pages_online"),
  {
    createdAt: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    slug: text().notNull(),
    lang: text().default("").notNull(),
    seo: jsonb().default({}),
    app: uuid().notNull(),
    buildTime: boolean().default(false),
    id: uuid().primaryKey().notNull(),
    name: text().notNull(),
    primaryPage: uuid(),
    blocks: jsonb().default([]),
    currentEditor: text(),
    changes: jsonb(),
    collection: text().default("page"),
    partialBlocks: text(),
    links: text(),
    online: boolean().default(true),
    pageType: text(),
    parent: uuid(),
    lastSaved: timestamp({ withTimezone: true, mode: "string" }),
    dynamic: boolean().default(false),
    libRefId: uuid(),
    dynamicSlugCustom: varchar().default(""),
    metadata: jsonb().default({}),
    tracking: jsonb().default({}),
    jsonld: jsonb().default({}),
    globalJsonLds: jsonb().default([]),
    designTokens: jsonb(),
  },
  (table) => [
    foreignKey({
      columns: [table.app],
      foreignColumns: [apps.id],
      name: getTableName("app_pages_online_app_fkey"),
    }),
  ],
);

export const appUserPlans = pgTable(
  getTableName("app_user_plans"),
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    user: text(),
    planId: text().default("FREE"),
    nextBilledAt: timestamp({ mode: "string" }).notNull(),
    subscriptionId: text(),
    client: uuid(),
    scheduledForCancellation: boolean().default(false),
  },
  (table) => [
    foreignKey({
      columns: [table.client],
      foreignColumns: [clients.id],
      name: getTableName("app_user_plans_client_fkey"),
    }),
  ],
);

export const appPages = pgTable(
  getTableName("app_pages"),
  {
    createdAt: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    slug: text().notNull(),
    lang: text().default("").notNull(),
    seo: jsonb().default({}),
    app: uuid().notNull(),
    buildTime: boolean().default(false),
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    primaryPage: uuid(),
    blocks: jsonb().default([]),
    currentEditor: text(),
    changes: jsonb(),
    collection: text().default("page"),
    online: boolean().default(false),
    parent: uuid(),
    pageType: text(),
    lastSaved: timestamp({ withTimezone: true, mode: "string" }),
    dynamic: boolean().default(false),
    libRefId: uuid(),
    dynamicSlugCustom: varchar().default(""),
    metadata: jsonb().default({}),
    tracking: jsonb().default({}),
    jsonld: jsonb().default({}),
    globalJsonLds: jsonb().default([]),
    links: text(),
    partialBlocks: text(),
    designTokens: jsonb(),
  },
  (table) => [
    foreignKey({
      columns: [table.app],
      foreignColumns: [apps.id],
      name: getTableName("app_pages_app_fkey"),
    }),
    foreignKey({
      columns: [table.parent],
      foreignColumns: [table.id],
      name: getTableName("app_pages_parent_fkey"),
    }),
  ],
);

export const appPagesMetadata = pgTable(
  getTableName("app_pages_metadata"),
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).generatedByDefaultAsIdentity({
      name: getTableName("app_pages_metadata_id_seq"),
      startWith: 1,
      increment: 1,
      minValue: 1,
      cache: 1,
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
    slug: varchar().notNull(),
    pageId: uuid().defaultRandom(),
    publishedAt: timestamp({ withTimezone: true, mode: "string" }),
    pageType: varchar(),
    pageBlocks: varchar(),
    dataBindings: varchar(),
    pageContent: varchar(),
    dataProviders: varchar(),
    app: uuid().defaultRandom().notNull(),
  },
  (table) => [primaryKey({ columns: [table.slug, table.app], name: "app_pages_metadata_pkey" })],
);
