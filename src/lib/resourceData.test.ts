import { parseReadme } from "./resourceData";

describe("parseReadme", () => {
  it("creates a visible group for a section without child headings", () => {
    const dataset = parseReadme(`
## Figma Plugins
- [Simple Design System](https://www.figma.com/community/file/123) - a starter kit
`);

    expect(dataset.groups).toHaveLength(1);
    expect(dataset.groups[0]).toMatchObject({
      title: "Figma Plugins",
      items: [
        {
          title: "Simple Design System",
          url: "https://www.figma.com/community/file/123",
          description: "a starter kit",
        },
      ],
    });
  });

  it("uses child headings as visible groups and keeps the parent title", () => {
    const dataset = parseReadme(`
## Libraries
### Icon Packs
- [Feather](https://feathericons.com) - open source icons
### Gradients
- [Mesh](https://meshgradient.com) - gradient generator
`);

    expect(dataset.groups).toHaveLength(2);
    expect(dataset.groups[0].title).toBe("Icon Packs");
    expect(dataset.groups[0].parentTitle).toBe("Libraries");
    expect(dataset.groups[1].title).toBe("Gradients");
  });

  it("preserves prefixed markers and supports items without descriptions", () => {
    const dataset = parseReadme(`
## AI Tools
- 🤖 [v0 by Vercel](https://v0.app/)
`);

    expect(dataset.groups[0].items[0]).toMatchObject({
      title: "🤖 v0 by Vercel",
      url: "https://v0.app/",
    });
  });

  it("skips malformed bullets safely", () => {
    const warningSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const dataset = parseReadme(`
## Broken
- not a link
- [Valid](https://example.com) - works
`);

    expect(dataset.groups[0].items).toHaveLength(1);
    expect(warningSpy).toHaveBeenCalledTimes(1);

    warningSpy.mockRestore();
  });
});

