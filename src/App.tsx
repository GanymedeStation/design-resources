import { useDeferredValue, useMemo, useState } from "react";
import { loadResourceDataset } from "./data/loadResourceDataset";
import type { ResourceDataset } from "./data/resourceTypes";
import githubIcon from "../assets/github.svg";
import logoImage from "../assets/logo.png";

const PROJECT_REPO_URL = "https://github.com/GanymedeStation/design-resources";
const AUTHOR_REPO_URL = "https://github.com/darelova";

interface AppProps {
  dataset?: ResourceDataset;
}

function App({ dataset = loadResourceDataset() }: AppProps) {
  const [query, setQuery] = useState("");
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

  return (
    <div className="page-shell">
      <main className="page">
        <header className="hero">
          <img className="brand-logo" src={logoImage} alt="" aria-hidden="true" />
          <h1>Awesome Design Resources</h1>
        </header>

        <div className="accent-line" aria-hidden="true" />

        <section className="search-panel" aria-label="Search resources">
          <label className="sr-only" htmlFor="resource-search">
            Search resources
          </label>
          <input
            id="resource-search"
            name="search"
            type="search"
            placeholder="Search"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />
        </section>

        <section className="groups" aria-label="Resource groups">
          {filteredGroups.length === 0 ? (
            <div className="empty-state">
              <h2>No resources found</h2>
              <p>Try another search term to explore the list.</p>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <section className="group-section" key={group.id} aria-labelledby={group.id}>
                <h2 id={group.id}>{renderGroupTitle(group.title)}</h2>
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
                      <span className="resource-title">{item.title}</span>
                      <span className="resource-url">{item.url}</span>
                    </a>
                  ))}
                </div>
              </section>
            ))
          )}
        </section>

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

export default App;
