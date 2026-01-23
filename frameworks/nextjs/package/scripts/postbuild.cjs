const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

async function resetPackageJson() {
  const packageJsonPath = path.join(__dirname, "..", "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  // Restore original SDK dependency if it exists
  if (packageJson._originalSdkDependency) {
    console.log("Resetting @chaibuilder/sdk to original dependency:", packageJson._originalSdkDependency);
    packageJson.dependencies["@chaibuilder/sdk"] = packageJson._originalSdkDependency;

    // Remove the temporary backup
    delete packageJson._originalSdkDependency;

    // Write restored package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
    console.log("Reset package.json to original SDK dependency");
  } else {
    console.log("No original SDK dependency found to restore");
  }
}

async function installDependencies() {
  try {
    console.log("Installing dependencies after reset...");
    execSync("pnpm install --no-frozen-lockfile", { stdio: "inherit", cwd: path.join(__dirname, "..") });
    console.log("Dependencies installed successfully after reset");
  } catch (error) {
    console.error("Failed to install dependencies after reset:", error.message);
    process.exit(1);
  }
}

async function main() {
  console.log("Starting postbuild script...");
  await resetPackageJson();
  await installDependencies();
  console.log("Postbuild script completed successfully");
}

main().catch((error) => {
  console.error("Postbuild script failed:", error);
  process.exit(1);
});
