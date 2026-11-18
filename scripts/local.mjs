#!/usr/bin/env node
// Run the portfolio on this machine — Windows, macOS and Linux.
//
//   node scripts/local.mjs            dev server, hot reload   → http://localhost:3000
//   node scripts/local.mjs prod       production build + serve
//   node scripts/local.mjs check      lint + typecheck + tests + build
//   node scripts/local.mjs dev 4000   any mode, custom port
//
// Needs Node.js 20.9+. Installs dependencies on first run.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const [mode = "dev", port = "3000"] = process.argv.slice(2);
const isWin = process.platform === "win32";

const bold = (text) => console.log(`\n\x1b[1m→ ${text}\x1b[0m`);
const fail = (text) => {
  console.error(`\x1b[31m✗ ${text}\x1b[0m`);
  process.exit(1);
};

const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 20 || (major === 20 && minor < 9)) {
  fail(`Node.js ${process.versions.node} is too old — Next.js 16 needs 20.9 or newer (https://nodejs.org).`);
}

/** Run a command in the project root; stop the whole script if it fails. */
function run(command, args) {
  // npm / npx are .cmd shims on Windows and need a shell to launch.
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit", shell: isWin });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (!existsSync(join(root, "node_modules"))) {
  bold("Installing dependencies (first run)…");
  run("npm", ["ci"]);
}

switch (mode) {
  case "dev":
    bold(`Dev server on http://localhost:${port}  (Ctrl+C to stop)`);
    run("npx", ["next", "dev", "-p", port]);
    break;
  case "prod":
    bold("Production build…");
    run("npm", ["run", "build"]);
    bold(`Serving the build on http://localhost:${port}  (Ctrl+C to stop)`);
    run("npx", ["next", "start", "-p", port]);
    break;
  case "check":
    bold("Lint");
    run("npm", ["run", "lint"]);
    bold("Typecheck");
    run("npx", ["tsc", "--noEmit"]);
    bold("Tests");
    run("npm", ["test"]);
    bold("Build");
    run("npm", ["run", "build"]);
    bold("All checks passed");
    break;
  default:
    fail(`Unknown mode "${mode}" — use dev, prod or check.`);
}
