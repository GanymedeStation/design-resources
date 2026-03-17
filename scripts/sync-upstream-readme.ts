import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_README_URL =
  "https://raw.githubusercontent.com/darelova/Awesome-Design-Resources-List/master/README.md";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const outputPath = path.join(projectRoot, "data", "upstream", "README.md");

export async function syncUpstreamReadme(): Promise<string> {
  const response = await fetch(SOURCE_README_URL);

  if (!response.ok) {
    throw new Error(`Failed to download README: ${response.status} ${response.statusText}`);
  }

  const markdown = await response.text();
  await writeFile(outputPath, markdown, "utf8");

  return markdown;
}

async function main() {
  const markdown = await syncUpstreamReadme();
  console.log(`Downloaded ${markdown.length} characters to ${outputPath}`);
}

void main();

