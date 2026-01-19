#!/usr/bin/env node

const prompts = require("prompts");
const postgres = require("postgres");
const dotenv = require("dotenv");
dotenv.config();

/**
 * ChaiBuilder Create App CLI
 */

const EXIT_CODES = {
  SUCCESS: 0,
  CONFIG_ERROR: 1,
  VALIDATION_ERROR: 2,
  DATABASE_ERROR: 3,
};

const QUESTIONS = [
  {
    name: "projectName",
    type: "text",
    message: "Enter the project name:",
    validate: (value) => (value && value.trim().length > 0 ? true : "Project name is required"),
  },
  {
    name: "ownerId",
    type: "text",
    message: "Enter the user ID (Optional):",
  },
];

async function promptForMissingValues() {
  const responses = await prompts(
    QUESTIONS,
    {
      onCancel: () => {
        console.log("⚠️ Operation cancelled.");
        process.exit(EXIT_CODES.SUCCESS);
      },
    },
  );

  return {
    ownerId: responses.ownerId?.trim() || null,
    projectName: responses.projectName?.trim() || null,
  };
}

async function createApp({ ownerId, projectName, databaseUrl }) {
  if (!projectName) {
    console.error("Project name is required.");
    process.exit(EXIT_CODES.VALIDATION_ERROR);
  }

  const sql = postgres(databaseUrl, { max: 1 });
  const libraryName = `${projectName}`;
  const normalizedOwnerId = ownerId && ownerId.length > 0 ? ownerId : null;

  try {
    const result = await sql.begin(async (tx) => {
      const [app] = await tx`
        insert into apps (name, "user")
        values (${projectName}, ${normalizedOwnerId})
        returning id
      `;

      const appId = app.id;

      await tx`
        insert into apps_online (id, name, "user", "apiKey")
        values (${appId}, ${projectName}, ${normalizedOwnerId}, ${appId})
      `;

      const [library] = await tx`
        insert into libraries (name, app, type)
        values (${libraryName}, ${appId}, 'default')
        returning id
      `;

      if (normalizedOwnerId) {
        await tx`
          insert into app_users ("user", app, role)
          values (${normalizedOwnerId}, ${appId}, 'admin')
        `;
      }

      const [page] = await tx`
        insert into app_pages (app, slug, name, "pageType")
        values (${appId}, '/', 'Home', 'page')
        returning id
      `;

      return {
        appId,
        libraryId: library.id,
        pageId: page.id,
        appKey: appId,
      };
    });

    console.log("\n✅  App created successfully!");
    console.log(`\nCHAIBUILDER_APP_KEY=${result.appKey}`);
    console.log("\nPlease add the CHAIBUILDER_APP_KEY value to your .env file.");
    process.exit(EXIT_CODES.SUCCESS);
  } catch (error) {
    console.error("Failed to create app:");
    console.error(error);
    process.exit(EXIT_CODES.DATABASE_ERROR);
  } finally {
    await sql.end({ timeout: 5 }).catch(() => null);
  }
}

async function runCli() {
  console.log("\nChaiBuilder Create App\n---------------------------");
  const databaseUrl = process.env.CHAIBUILDER_DATABASE_URL;
  if (!databaseUrl) {
    console.error("Missing database connection string. Please set the CHAIBUILDER_DATABASE_URL environment variable");
    process.exit(EXIT_CODES.CONFIG_ERROR);
  }
  const { ownerId, projectName } = await promptForMissingValues();

  await createApp({ ownerId, projectName, databaseUrl });
}

if (require.main === module) {
  runCli();
}

module.exports = {
  createApp,
  runCli,
};
