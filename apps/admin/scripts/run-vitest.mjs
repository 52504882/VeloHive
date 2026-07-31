import { spawnSync } from "node:child_process";

const args = process.argv.slice(2).filter((arg) => arg !== "--runInBand");
const result = spawnSync("vitest", ["run", ...args], {
  shell: true,
  stdio: "inherit"
});

process.exit(result.status ?? 1);
