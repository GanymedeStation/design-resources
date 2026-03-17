# AGENTS.md

## Project overview

This repository is a React + TypeScript frontend for the upstream "Awesome Design Resources List". The app renders a generated JSON dataset and is deployed as a static asset bundle served by a minimal Cloudflare Worker.

Key flow:

1. `data/upstream/README.md` is the local source copy of the upstream curated list.
2. `scripts/generate-resource-data.ts` converts that Markdown into `src/data/resources.json`.
3. `src/App.tsx` renders the generated dataset with client-side search.
4. `worker/index.ts` serves the production build from `dist/`.

## Important files

- `src/App.tsx`: main UI and search behavior
- `src/styles.css`: app styling
- `src/lib/resourceData.ts`: parser for the upstream Markdown list
- `src/lib/resourceData.test.ts`: parser tests
- `src/App.test.tsx`: app-level tests
- `src/data/resources.json`: generated dataset consumed by the frontend
- `data/upstream/README.md`: canonical local source for dataset generation
- `scripts/generate-resource-data.ts`: regenerate structured data from the local Markdown file
- `scripts/sync-upstream-readme.ts`: fetch the latest upstream README, then regenerate data via npm script
- `worker/index.ts`: Cloudflare Worker entrypoint
- `wrangler.jsonc`: deployment config

## Working agreements

- Do not hand-edit `src/data/resources.json` unless the user explicitly asks for a one-off manual fix. Prefer regenerating it.
- Do not hand-edit `dist/`; it is build output.
- If you change parsing behavior in `src/lib/resourceData.ts`, update tests in `src/lib/resourceData.test.ts`.
- If you change the shape or content of generated resource data, regenerate `src/data/resources.json`.
- Keep the Worker small unless there is a clear product need; most changes should stay in the frontend or data pipeline.
- Preserve accessibility basics in the UI, especially for search, headings, and link behavior.

## Common commands

Install dependencies:

```bash
npm install
```

Run the frontend locally:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Watch tests:

```bash
npm run test:watch
```

Build production assets:

```bash
npm run build
```

Regenerate data from the local upstream README:

```bash
npm run generate:data
```

Fetch the latest upstream README and regenerate data:

```bash
npm run sync:data
```

Deploy to Cloudflare:

```bash
npm run deploy
```

## Change guidance

### UI changes

- Main app behavior lives in `src/App.tsx`.
- Styling changes should usually stay in `src/styles.css`.
- When changing search behavior, make sure filtering still works against titles, URLs, descriptions, and group names.

### Data/parser changes

- Parser logic lives in `src/lib/resourceData.ts`.
- The parser currently reads `##` headings as sections, `###` headings as child groups, and bullet Markdown links as resources.
- The parser intentionally skips malformed bullets with a warning instead of failing hard.
- After parser changes, run `npm test` and `npm run generate:data`.

### Source list refreshes

- Use `npm run sync:data` to pull a fresh upstream README and rebuild the JSON dataset.
- Review regenerated data when the upstream list changes significantly, because group titles or item formats may affect parsing.

### Deployment changes

- Cloudflare config lives in `wrangler.jsonc`.
- The Worker in `worker/index.ts` is currently just an asset passthrough. Avoid adding server logic unless the user explicitly wants runtime behavior.

## Validation checklist

After code changes, use the smallest relevant validation set:

- UI-only change: run `npm test`
- Parser change: run `npm test` and `npm run generate:data`
- Deployment-related change: run `npm run build`

If you could not run validation, say so clearly in your handoff.

## Handoff notes

- Mention whether `src/data/resources.json` changed, because generated data can create large diffs.
- Mention whether you ran `npm test`, `npm run build`, or data regeneration commands.
- Offer one sensible next step after finishing, such as adding tests, refreshing upstream data, or improving deployment docs.
