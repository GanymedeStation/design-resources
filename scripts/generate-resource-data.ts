import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseReadme } from "../src/lib/resourceData";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const readmePath = path.join(projectRoot, "data", "upstream", "README.md");
const outputPath = path.join(projectRoot, "src", "data", "resources.json");

async function main() {
  const markdown = await readFile(readmePath, "utf8");
  const dataset = parseReadme(markdown);

  await writeFile(outputPath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");

  console.log(`Generated ${dataset.groups.length} resource groups at ${outputPath}`);
}

void main();

