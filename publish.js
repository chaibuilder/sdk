#!/usr/bin/env node

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { dirname } from "path";
import readline from "readline";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// Function to get current branch name
function getCurrentBranch() {
  return execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
}

// Function to safely push to a branch
function safePushToBranch(branch, targetBranch = "main") {
  try {
    // First try to push with upstream tracking
    execCommand(`git push -u origin "${branch}:${targetBranch}"`);
  } catch (error) {
    console.error(
      "Failed to push to remote. Please ensure you have the right permissions and the branch name is valid.",
    );
    throw error;
  }
}

// Function to ask yes/no question
function askYesNo(question) {
  return new Promise((resolve) => {
    rl.question(`${question} (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

async function main() {
  try {
    // Read current version from package.json
    const packageJson = JSON.parse(readFileSync("./package.json", "utf8"));
    const currentVersion = packageJson.version;
    console.log(`Current SDK version: ${currentVersion}`);

    // Check for @chaibuilder/runtime in dependencies and peerDependencies
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const peerDependencies = packageJson.peerDependencies || {};
    const runtimeVersion = dependencies["@chaibuilder/runtime"] || peerDependencies["@chaibuilder/runtime"];
    if (runtimeVersion) {
      console.log(`Current Runtime version: ${runtimeVersion}`);
      if (peerDependencies["@chaibuilder/runtime"]) {
        console.log(`(specified in peerDependencies)`);
      }
    }

    // Ask for new version
    const newVersion = await new Promise((resolve) => {
      rl.question("Enter new SDK version number: ", resolve);
    });

    // Validate new version
    validateVersion(newVersion);

    // Ask about runtime version update if it exists in dependencies
    let updateRuntime = false;
    let newRuntimeVersion;
    if (runtimeVersion) {
      updateRuntime = await askYesNo("Do you want to update @chaibuilder/runtime version as well?");
      if (updateRuntime) {
        newRuntimeVersion = await new Promise((resolve) => {
          rl.question("Enter new Runtime version number: ", resolve);
        });
        validateVersion(newRuntimeVersion);
      }
    }

    // Get current branch name
    const currentBranch = getCurrentBranch();

    // Update SDK version in package.json (without git tag)
    execCommand(`pnpm version ${newVersion} --no-git-tag-version`);

    // Update runtime version if requested
    if (updateRuntime && newRuntimeVersion) {
      // Update in dependencies if it exists there
      if (dependencies["@chaibuilder/runtime"]) {
        execCommand(`pnpm add @chaibuilder/runtime@${newRuntimeVersion} --save-exact`);
      }

      // Update in peerDependencies if it exists there
      if (peerDependencies["@chaibuilder/runtime"]) {
        const updatedPackageJson = JSON.parse(readFileSync("./package.json", "utf8"));
        if (!updatedPackageJson.peerDependencies) {
          updatedPackageJson.peerDependencies = {};
        }
        updatedPackageJson.peerDependencies["@chaibuilder/runtime"] = newRuntimeVersion;
        writeFileSync("./package.json", JSON.stringify(updatedPackageJson, null, 2) + "\n");
      }
    }

    // Git operations
    execCommand("git add package.json");
    if (updateRuntime && dependencies["@chaibuilder/runtime"]) {
      execCommand("git add pnpm-lock.yaml");
    }
    execCommand(
      `git commit -m "chore: bump version to ${newVersion}${updateRuntime ? ` and runtime to ${newRuntimeVersion}` : ""}"`,
    );

    // Build the project
    execCommand("pnpm run build");

    // Create and push tag
    execCommand(`git tag -a v${newVersion} -m "Release version ${newVersion}"`);

    // Safely push to main branch
    safePushToBranch(currentBranch, "main");

    // Push the tag
    execCommand(`git push origin v${newVersion}`);

    console.log(`✅ Version bumped to ${newVersion} and tag created successfully!`);
    if (updateRuntime) {
      console.log(`✅ Runtime version bumped to ${newRuntimeVersion}`);
    }
    console.log(`🔄 Created and pushed tag v${newVersion}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    // Revert package.json changes
    execCommand("git checkout package.json");
    execCommand("git checkout pnpm-lock.yaml");
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
