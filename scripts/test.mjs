// Cross-platform test runner: expands tests/*.test.ts ourselves, because
// cmd.exe does not expand globs and Node 20's --test does not either.
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const files = readdirSync(join(root, "tests"))
  .filter((name) => name.endsWith(".test.ts"))
  .map((name) => join("tests", name));

const result = spawnSync(process.execPath, ["--import", "tsx", "--test", ...files], {
  cwd: root,
  stdio: "inherit",
});
process.exit(result.status ?? 1);
