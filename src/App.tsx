import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { loadResourceDataset } from "./data/loadResourceDataset";
import type { ResourceDataset, ResourceItem } from "./data/resourceTypes";
import githubIcon from "../assets/github.svg";
import logoImage from "../assets/logo.png";

const PROJECT_REPO_URL = "https://github.com/GanymedeStation/design-resources";
const AUTHOR_REPO_URL = "https://github.com/darelova";

interface AppProps {
  dataset?: ResourceDataset;
}

function App({ dataset = loadResourceDataset() }: AppProps) {
  const [query, setQuery] = useState("");
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [shouldAutoFocusSearch] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return true;
    }

    return !window.matchMedia("(pointer: coarse)").matches;
  });
  const [shouldRestoreScroll] = useState(() => {
    if (typeof window === "undefined" || typeof performance === "undefined") {
      return false;
    }

    const navigationEntries = performance.getEntriesByType("navigation");
    return navigationEntries[0]?.type === "back_forward";
  });
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const paletteInputRef = useRef<HTMLInputElement | null>(null);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    if (!normalizedQuery) {
      return dataset.groups;
    }

    return dataset.groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.searchText.includes(normalizedQuery)),
      }))
      .filter((group) => group.items.length > 0);
  }, [dataset.groups, normalizedQuery]);

  const paletteResults = useMemo(() => {
    const normalizedPaletteQuery = paletteQuery.trim().toLowerCase();
    const allItems = dataset.groups.flatMap((group) =>
      group.items.map((item) => ({
        item,
        groupId: group.id,
        groupTitle: group.title,
      })),
    );

    if (!normalizedPaletteQuery) {
      return allItems.slice(0, 10);
    }

    return allItems
      .filter(({ item, groupTitle }) =>
        [item.searchText, groupTitle].filter(Boolean).join(" ").includes(normalizedPaletteQuery),
      )
      .slice(0, 10);
  }, [dataset.groups, paletteQuery]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsPaletteOpen(true);
        return;
      }

      if (event.key === "Escape") {
        setIsPaletteOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isPaletteOpen) {
      return;
    }

    paletteInputRef.current?.focus();
  }, [isPaletteOpen]);

  useEffect(() => {
    if (!shouldAutoFocusSearch || shouldRestoreScroll) {
      return;
    }

    searchInputRef.current?.focus({ preventScroll: true });
  }, [shouldAutoFocusSearch, shouldRestoreScroll]);

  function closePalette() {
    setIsPaletteOpen(false);
    setPaletteQuery("");
  }

  function handlePaletteResultSelect(item: ResourceItem) {
    setQuery(item.title);
    closePalette();
  }

  return (
    <div className="page-shell">
      <main className="page">
        <a className="top-anchor" id="top" href="#top" aria-hidden="true" tabIndex={-1} />
        <header className="hero">
          <div className="hero-brand">
            <img className="brand-logo" src={logoImage} alt="" aria-hidden="true" />
            <h1>Awesome Design Resources</h1>
          </div>
        </header>

        <section className="search-panel" aria-label="Search resources">
          <div className="search-copy">
            <p className="search-label">Find by title, description, URL, or category</p>
            <p className="search-hint">Use search to narrow the catalog without losing group context.</p>
          </div>
          <div className="search-control">
            <label className="sr-only" htmlFor="resource-search">
              Search resources
            </label>
            <input
              ref={searchInputRef}
              id="resource-search"
              name="search"
              type="search"
              placeholder={
                shouldAutoFocusSearch ? "Search resources (Cmd/Ctrl+K)" : "Search resources"
              }
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
            />
          </div>
        </section>

        {isPaletteOpen ? (
          <div
            className="command-palette-backdrop"
            role="presentation"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                closePalette();
              }
            }}
          >
            <div
              className="command-palette"
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
            >
              <div className="command-palette-header">
                <p className="command-palette-label">Quick search</p>
                <button
                  className="command-palette-close"
                  type="button"
                  onClick={closePalette}
                  aria-label="Close command palette"
                >
                  Esc
                </button>
              </div>
              <label className="sr-only" htmlFor="command-palette-search">
                Search all resources
              </label>
              <input
                ref={paletteInputRef}
                id="command-palette-search"
                className="command-palette-input"
                type="search"
                placeholder="Search any resource"
                value={paletteQuery}
                onChange={(event) => setPaletteQuery(event.target.value)}
                autoComplete="off"
              />
              <div className="command-palette-results">
                {paletteResults.length === 0 ? (
                  <p className="command-palette-empty">No matching resources.</p>
                ) : (
                  paletteResults.map(({ item, groupId, groupTitle }) => (
                    <a
                      className="command-palette-item"
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => handlePaletteResultSelect(item)}
                    >
                      <span className="command-palette-item-main">
                        <span className="command-palette-item-title">{item.title}</span>
                        <span className="command-palette-item-description">
                          {item.description ?? "Open resource"}
                        </span>
                      </span>
                      <span className="command-palette-item-meta">
                        <span>{groupTitle}</span>
                        <span className="command-palette-item-domain">
                          {formatHostname(item.url)}
                        </span>
                      </span>
                      <span className="sr-only">Jump target #{groupId}</span>
                    </a>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : null}

        {filteredGroups.length > 0 ? (
          <nav className="contents-nav" aria-label="Sections">
            <p className="contents-label">Sections</p>
            <div className="contents-list">
              {filteredGroups.map((group) => (
                <a className="contents-link" key={group.id} href={`#${group.id}`}>
                  <span>{group.title}</span>
                  <span className="contents-count">{group.items.length}</span>
                </a>
              ))}
            </div>
          </nav>
        ) : null}

        <section className="groups" aria-label="Resource groups">
          {filteredGroups.length === 0 ? (
            <div className="empty-state">
              <h2>No resources found</h2>
              <p>Try another search term to explore the list.</p>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <section className="group-section" key={group.id} aria-labelledby={group.id}>
                <div className="group-heading">
                  <div>
                    <h2 id={group.id}>{renderGroupTitle(group.title)}</h2>
                  </div>
                  <p className="group-count">
                    {group.items.length} {group.items.length === 1 ? "resource" : "resources"}
                  </p>
                </div>
                <div className="card-grid">
                  {group.items.map((item) => (
                    <a
                      className="resource-card"
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      title={item.description ? `${item.title}: ${item.description}` : item.title}
                    >
                      <div className="resource-main">
                        <span className="resource-title">{item.title}</span>
                        <span className="resource-description">
                          {item.description ?? "Open the resource to review the full listing."}
                        </span>
                      </div>
                      <div className="resource-meta" aria-hidden="true">
                        <span className="resource-domain">{formatHostname(item.url)}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            ))
          )}
        </section>

        <a className="back-to-top back-to-top-floating" href="#top">
          Back to top
        </a>

        <footer className="footer">
          <div className="accent-line footer-line" aria-hidden="true" />
          <p>
            Frontend for{" "}
            <a href={dataset.sourceRepoUrl} target="_blank" rel="noreferrer">
              Awesome Design Resources List
            </a>{" "}
            by{" "}
            <a href={AUTHOR_REPO_URL} target="_blank" rel="noreferrer">
              Yanka Darelova
            </a>
          </p>
          <p>GNU General Public License v3.0</p>
          <a
            className="project-link"
            href={PROJECT_REPO_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Project GitHub repository"
          >
            <img src={githubIcon} alt="" />
          </a>
        </footer>
      </main>
    </div>
  );
}

function renderGroupTitle(title: string) {
  const match = title.match(/^(.*?)(\s*\(.+\))$/);

  if (!match) {
    return title;
  }

  return (
    <>
      <span>{match[1].trim()}</span>
      <span className="group-heading-meta">{match[2]}</span>
    </>
  );
}

function formatHostname(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

export default App;
