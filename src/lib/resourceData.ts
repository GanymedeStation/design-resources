import type { ResourceDataset, ResourceGroup, ResourceItem } from "../data/resourceTypes";

const SOURCE_REPO_URL = "https://github.com/darelova/Awesome-Design-Resources-List";
const SOURCE_README_URL =
  "https://raw.githubusercontent.com/darelova/Awesome-Design-Resources-List/master/README.md";

interface DraftGroup {
  title: string;
  parentTitle?: string;
  items: ResourceItem[];
}

interface DraftSection {
  title: string;
  items: ResourceItem[];
  childGroups: DraftGroup[];
}

export function parseReadme(markdown: string): ResourceDataset {
  const lines = markdown.split(/\r?\n/);
  const sections: DraftSection[] = [];
  let currentSection: DraftSection | null = null;
  let currentChildGroup: DraftGroup | null = null;
  let itemIndex = 0;

  for (const line of lines) {
    const sectionMatch = line.match(/^##\s+(.+?)\s*$/);

    if (sectionMatch) {
      currentSection = {
        title: normalizeHeading(sectionMatch[1]),
        items: [],
        childGroups: [],
      };
      currentChildGroup = null;
      sections.push(currentSection);
      continue;
    }

    const childMatch = line.match(/^###\s+(.+?)\s*$/);

    if (childMatch && currentSection) {
      currentChildGroup = {
        title: normalizeHeading(childMatch[1]),
        parentTitle: currentSection.title,
        items: [],
      };
      currentSection.childGroups.push(currentChildGroup);
      continue;
    }

    const bulletMatch = line.match(/^- (.+)$/);

    if (!bulletMatch || !currentSection) {
      continue;
    }

    const parsedItem = parseBullet(bulletMatch[1], itemIndex);

    if (!parsedItem) {
      console.warn(`Skipping malformed resource entry: ${line}`);
      continue;
    }

    itemIndex += 1;

    if (currentChildGroup) {
      currentChildGroup.items.push(parsedItem);
    } else {
      currentSection.items.push(parsedItem);
    }
  }

  const groups = finalizeGroups(sections);

  return {
    generatedAt: new Date().toISOString(),
    sourceRepoUrl: SOURCE_REPO_URL,
    sourceReadmeUrl: SOURCE_README_URL,
    groups,
  };
}

function finalizeGroups(sections: DraftSection[]): ResourceGroup[] {
  const groups: ResourceGroup[] = [];
  const titleCounts = new Map<string, number>();

  for (const section of sections) {
    if (section.items.length > 0) {
      groups.push(toGroup(section.title, section.items, section.title, titleCounts));
    }

    for (const childGroup of section.childGroups) {
      if (childGroup.items.length === 0) {
        continue;
      }

      groups.push(
        toGroup(childGroup.title, childGroup.items, childGroup.parentTitle, titleCounts),
      );
    }
  }

  return groups;
}

function toGroup(
  title: string,
  items: ResourceItem[],
  parentTitle: string | undefined,
  titleCounts: Map<string, number>,
): ResourceGroup {
  const slugBase = slugify(title);
  const count = titleCounts.get(slugBase) ?? 0;
  titleCounts.set(slugBase, count + 1);

  return {
    id: count === 0 ? slugBase : `${slugBase}-${count + 1}`,
    title,
    parentTitle,
    items: items.map((item) => ({
      ...item,
      searchText: [item.title, item.url, item.description, title, parentTitle]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    })),
  };
}

function parseBullet(content: string, itemIndex: number): ResourceItem | null {
  const markdownLink = content.match(/^(?<prefix>[^\[]*?)\[(?<title>.+?)\]\((?<url>https?:\/\/.+?)\)(?:\s*-\s*(?<description>.+))?$/);

  if (!markdownLink?.groups) {
    return null;
  }

  const prefix = markdownLink.groups.prefix.trim();
  const title = [prefix, markdownLink.groups.title.trim()].filter(Boolean).join(" ");
  const url = markdownLink.groups.url.trim();
  const description = markdownLink.groups.description?.trim();

  return {
    id: `resource-${itemIndex + 1}`,
    title,
    url,
    description,
    searchText: "",
  };
}

function normalizeHeading(value: string): string {
  return value.replace(/^[^\p{L}\p{N}]+/u, "").trim();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

