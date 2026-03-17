import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import type { ResourceDataset } from "./data/resourceTypes";

const dataset: ResourceDataset = {
  generatedAt: "2026-03-17T10:00:00.000Z",
  sourceRepoUrl: "https://github.com/darelova/Awesome-Design-Resources-List",
  sourceReadmeUrl:
    "https://raw.githubusercontent.com/darelova/Awesome-Design-Resources-List/master/README.md",
  groups: [
    {
      id: "figma",
      title: "Figma plugins & resources",
      items: [
        {
          id: "resource-1",
          title: "Simple Design System",
          url: "https://www.figma.com/community/file/123",
          description: "a starter kit",
          searchText: "simple design system https://www.figma.com/community/file/123 a starter kit",
        },
      ],
    },
    {
      id: "icons",
      title: "Icon packs",
      items: [
        {
          id: "resource-2",
          title: "Heroicons",
          url: "https://heroicons.com",
          description: "svg icon set",
          searchText: "heroicons https://heroicons.com svg icon set",
        },
      ],
    },
  ],
};

describe("App", () => {
  it("renders grouped cards from the dataset", () => {
    render(<App dataset={dataset} />);

    expect(screen.getByRole("heading", { name: "Figma plugins & resources" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /simple design system/i })).toBeInTheDocument();
  });

  it("filters groups and items by the search query", async () => {
    const user = userEvent.setup();

    render(<App dataset={dataset} />);

    await user.type(screen.getByRole("searchbox", { name: /search resources/i }), "hero");

    expect(screen.queryByText("Figma plugins & resources")).not.toBeInTheDocument();
    expect(screen.getByText("Icon packs")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /heroicons/i })).toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", async () => {
    const user = userEvent.setup();

    render(<App dataset={dataset} />);

    await user.type(screen.getByRole("searchbox", { name: /search resources/i }), "typography");

    expect(screen.getByText("No resources found")).toBeInTheDocument();
  });

  it("opens footer and resource links in a new tab", () => {
    render(<App dataset={dataset} />);

    const resourceLink = screen.getByRole("link", { name: /simple design system/i });
    const sourceLink = screen.getByRole("link", {
      name: /awesome design resources list/i,
    });
    const authorLink = screen.getByRole("link", { name: /yanka darelova/i });
    const projectLink = screen.getByRole("link", { name: /project github repository/i });

    expect(resourceLink).toHaveAttribute("target", "_blank");
    expect(sourceLink).toHaveAttribute("target", "_blank");
    expect(authorLink).toHaveAttribute("target", "_blank");
    expect(projectLink).toHaveAttribute("target", "_blank");
  });
});
