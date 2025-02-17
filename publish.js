#!/usr/bin/env node

const { execSync } = require("child_process");
const readline = require("readline");
const fs = require("fs");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to validate version number
function validateVersion(version) {
  const regex = /^[0-9]+\.[0-9]+\.[0-9]+(-beta\.[0-9]+)?$/;
  if (!regex.test(version)) {
    throw new Error("Invalid version format. Please use format: x.x.x or x.x.x-beta.x");
  }
  return version;
}

// Function to execute shell commands
function execCommand(command) {
  try {
    return execSync(command, { stdio: "inherit" });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    process.exit(1);
  }
}

async function main() {
  try {
    // Read current version from package.json
    const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));
    const currentVersion = packageJson.version;
    console.log(`Current version: ${currentVersion}`);

    // Ask for new version
    const newVersion = await new Promise((resolve) => {
      rl.question("Enter new version number: ", resolve);
    });

    // Validate new version
    validateVersion(newVersion);

    // Update version in package.json (without git tag)
    execCommand(`pnpm version v${newVersion} --no-git-tag-version`);

    // Build the project
    execCommand("pnpm run build");

    // Run tests
    execCommand("pnpm test");
    v;
    // Git operations
    execCommand("git add package.json");
    execCommand(`git commit -m "chore: bump version to ${newVersion}"`);

    // Create and push tag
    execCommand(`git tag -a v${newVersion} -m "Release version ${newVersion}"`);
    execCommand("git push origin main"); // Push commit to main
    execCommand(`git push origin v${newVersion}`); // Push tag

    console.log(`✅ Version bumped to ${newVersion} and tag created successfully!`);
    console.log(`🔄 Created and pushed tag v${newVersion}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    // Revert package.json changes
    execCommand("git checkout package.json");
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
