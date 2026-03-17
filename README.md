# design-resources

A searchable frontend for the [Awesome Design Resources List](https://github.com/darelova/Awesome-Design-Resources-List) by [Yanka Darelova](https://github.com/darelova).

This project turns the upstream Markdown list into a structured JSON dataset, then renders it as a fast React app with grouped cards and instant search. It is built with Vite, tested with Vitest, and deployed with a small Cloudflare Worker that serves the static build output.

## Features

- Fast client-side search across resource titles, URLs, descriptions, and group names
- Generated local dataset based on the upstream curated README
- Simple maintenance workflow for syncing and rebuilding the resource catalog
- Static frontend build served through Cloudflare Workers assets
- Lightweight test coverage for the README parsing logic and app behavior

## Stack

- React 19
- TypeScript
- Vite
- Vitest + Testing Library
- Cloudflare Workers + Wrangler

## Project structure

```text
.
├── assets/                      # Fonts, logo, and other static design assets
├── data/upstream/README.md      # Local copy of the upstream resource list
├── scripts/
│   ├── generate-resource-data.ts
│   └── sync-upstream-readme.ts
├── src/
│   ├── data/
│   │   ├── loadResourceDataset.ts
│   │   ├── resourceTypes.ts
│   │   └── resources.json       # Generated dataset used by the app
│   ├── lib/resourceData.ts      # Markdown parser for the upstream README
│   ├── App.tsx
│   └── styles.css
├── worker/index.ts              # Cloudflare Worker entrypoint
└── wrangler.jsonc               # Cloudflare deployment config
```

## How it works

The app does not fetch resources at runtime. Instead, the source list is processed ahead of time:

1. `data/upstream/README.md` stores a local copy of the upstream awesome list.
2. `scripts/generate-resource-data.ts` parses that Markdown into `src/data/resources.json`.
3. `src/App.tsx` loads the generated JSON and renders searchable groups of resource cards.
4. `worker/index.ts` serves the Vite build output from `dist/` using Cloudflare assets.

The parser in `src/lib/resourceData.ts`:

- treats `##` headings as sections
- treats `###` headings as child groups
- extracts Markdown links from bullet items
- preserves optional emoji or text prefixes in titles
- creates a lowercase `searchText` field for filtering in the UI

## Getting started

### Prerequisites

- Node.js 20+ recommended
- npm

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

This starts the Vite dev server for the React frontend.

## Available scripts

### `npm run dev`

Run the Vite development server.

### `npm run build`

Type-check the project and create a production build in `dist/`.

### `npm run preview`

Serve the production build locally with Vite preview.

### `npm test`

Run the Vitest test suite once.

### `npm run test:watch`

Run Vitest in watch mode during development.

### `npm run generate:data`

Parse `data/upstream/README.md` and regenerate `src/data/resources.json`.

Use this after editing the local upstream README copy or changing the parser.

### `npm run sync:data`

Download the latest upstream README and immediately regenerate the JSON dataset.

This is the main maintenance command when you want to refresh the catalog from the source repository.

### `npm run deploy`

Build the app and deploy it with Wrangler.

## Data workflow

When the upstream list changes, the usual refresh flow is:

```bash
npm run sync:data
```

If you are only adjusting parser behavior or testing a modified local source file, use:

```bash
npm run generate:data
```

The generated file `src/data/resources.json` is part of the app input, so changes to the dataset should generally be committed along with parser or source updates.

## Testing

The current test coverage focuses on the resource parsing behavior, including:

- sections without child headings
- nested child groups
- entries with emoji or other text prefixes
- malformed bullet items that should be skipped safely

If you change the parsing rules in `src/lib/resourceData.ts`, update or add tests in `src/lib/resourceData.test.ts`.

## Deployment

Deployment is configured for Cloudflare Workers via [`wrangler.jsonc`](./wrangler.jsonc).

The Worker itself is intentionally small: it forwards requests to the bound static assets bundle generated in `dist/`.

Typical deployment flow:

```bash
npm run deploy
```

Before deploying, make sure:

- dependencies are installed
- the project builds cleanly
- any dataset updates have been regenerated
- you are authenticated with Wrangler in the environment you are deploying from

## Notes for contributors

- `src/data/resources.json` is generated code-like data, not hand-edited source
- `data/upstream/README.md` is the canonical local input for dataset generation
- `dist/` contains build output and can be regenerated at any time
- search uses a deferred query in React to keep filtering responsive as the user types

## License

This project is licensed under the GNU General Public License v3.0. See [LICENSE](./LICENSE).

## Upstream credit

The curated resource list comes from [darelova/Awesome-Design-Resources-List](https://github.com/darelova/Awesome-Design-Resources-List). This repository provides an alternate frontend and generated dataset around that source material.
