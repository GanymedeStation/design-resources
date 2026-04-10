const ERROR_COPY: Record<number, { title: string; message: string }> = {
  400: {
    title: "Bad request",
    message: "This request could not be understood. Double-check the address and try again.",
  },
  403: {
    title: "Access denied",
    message: "This route exists, but this request is not allowed from here.",
  },
  404: {
    title: "Page not found",
    message: "The page you asked for is missing or has moved. The home page is a safe reset.",
  },
  405: {
    title: "Method not allowed",
    message: "This path only accepts certain request methods. Try a normal page visit instead.",
  },
};

const HTML_HEADERS = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "no-store",
  "x-robots-tag": "noindex",
};

export function createClientErrorResponse(
  status: number,
  requestUrl: URL,
  requestMethod = "GET",
): Response {
  const copy = ERROR_COPY[status] ?? {
    title: "Request blocked",
    message: "The server could not complete this request.",
  };

  const body = requestMethod === "HEAD" ? null : renderErrorPage({ status, ...copy, path: requestUrl.pathname });

  return new Response(body, {
    status,
    headers: HTML_HEADERS,
  });
}

function renderErrorPage({
  status,
  title,
  message,
  path,
}: {
  status: number;
  title: string;
  message: string;
  path: string;
}) {
  const escapedPath = escapeHtml(path);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
    <title>${status} ${escapeHtml(title)} | Awesome Design Resources</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: oklch(0.18 0.02 285);
        --bg-soft: oklch(0.23 0.03 285 / 0.92);
        --bg-panel: oklch(0.22 0.03 285 / 0.84);
        --line: oklch(1 0 0 / 0.12);
        --line-strong: oklch(1 0 0 / 0.2);
        --text: oklch(0.96 0.01 285);
        --text-soft: oklch(0.8 0.02 285);
        --muted: oklch(0.69 0.02 285);
        --accent: oklch(0.68 0.18 18);
        --accent-soft: oklch(0.68 0.18 18 / 0.16);
        --shadow: 0 30px 80px oklch(0 0 0 / 0.35);
      }

      * { box-sizing: border-box; }

      html, body { min-height: 100%; }

      body {
        margin: 0;
        min-width: 320px;
        font-family: "Helvetica Neue", Arial, sans-serif;
        background:
          radial-gradient(circle at 12% 18%, oklch(0.66 0.18 18 / 0.16), transparent 24%),
          radial-gradient(circle at 84% 12%, oklch(0.87 0.04 90 / 0.1), transparent 20%),
          linear-gradient(180deg, oklch(0.17 0.02 285), oklch(0.13 0.02 285)),
          var(--bg);
        color: var(--text);
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      .page {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: clamp(20px, 5vw, 56px);
      }

      .frame {
        width: min(980px, 100%);
        display: grid;
        grid-template-columns: minmax(0, 0.88fr) minmax(0, 1.12fr);
        gap: clamp(18px, 3vw, 34px);
        align-items: stretch;
      }

      .code-panel,
      .content-panel {
        border: 1px solid var(--line);
        border-radius: 30px;
        background: linear-gradient(180deg, var(--bg-soft), var(--bg-panel));
        box-shadow: var(--shadow);
        overflow: hidden;
      }

      .code-panel {
        position: relative;
        display: grid;
        place-items: center;
        min-height: 280px;
        padding: 28px;
      }

      .code-panel::before,
      .code-panel::after {
        content: "";
        position: absolute;
        inset: 18px;
        border-radius: 24px;
        pointer-events: none;
      }

      .code-panel::before {
        border: 1px solid var(--line);
      }

      .code-panel::after {
        inset: auto 28px 28px;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--accent), transparent);
      }

      .status {
        position: relative;
        display: grid;
        gap: 8px;
        text-align: center;
      }

      .status-kicker {
        margin: 0;
        color: var(--muted);
        font-size: 0.78rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      .status-code {
        margin: 0;
        font-size: clamp(4.2rem, 10vw, 7.5rem);
        line-height: 0.88;
        letter-spacing: -0.06em;
      }

      .status-chip {
        justify-self: center;
        padding: 8px 12px;
        border: 1px solid var(--line-strong);
        border-radius: 999px;
        background: var(--accent-soft);
        color: var(--text);
        font-size: 0.82rem;
      }

      .content-panel {
        display: grid;
        grid-template-rows: auto 1fr auto;
        padding: clamp(22px, 3vw, 32px);
      }

      .eyebrow {
        margin: 0 0 18px;
        color: var(--muted);
        font-size: 0.78rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }

      h1 {
        margin: 0;
        max-width: 12ch;
        font-size: clamp(2.2rem, 4.6vw, 4.4rem);
        line-height: 0.94;
        letter-spacing: -0.05em;
      }

      .message {
        max-width: 34rem;
        margin: 18px 0 0;
        color: var(--text-soft);
        font-size: clamp(1rem, 1.4vw, 1.12rem);
        line-height: 1.65;
      }

      .meta {
        display: grid;
        gap: 12px;
        margin-top: 26px;
      }

      .path-label {
        margin: 0;
        color: var(--muted);
        font-size: 0.76rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      .path {
        display: inline-flex;
        width: fit-content;
        max-width: 100%;
        padding: 10px 14px;
        border: 1px solid var(--line-strong);
        border-radius: 14px;
        background: oklch(0 0 0 / 0.14);
        color: var(--text);
        word-break: break-word;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
        margin-top: 28px;
      }

      .button,
      .link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        padding: 10px 16px;
        border-radius: 999px;
        border: 1px solid transparent;
        font-weight: 600;
        transition:
          transform 160ms ease,
          border-color 160ms ease,
          background-color 160ms ease;
      }

      .button {
        background: var(--accent);
        color: oklch(0.17 0.02 285);
      }

      .link {
        border-color: var(--line-strong);
        background: oklch(1 0 0 / 0.04);
      }

      .button:hover,
      .button:focus-visible,
      .link:hover,
      .link:focus-visible {
        transform: translateY(-1px);
      }

      .button:hover,
      .button:focus-visible {
        background: color-mix(in oklch, var(--accent) 92%, white);
      }

      .link:hover,
      .link:focus-visible {
        border-color: oklch(1 0 0 / 0.26);
        background: oklch(1 0 0 / 0.08);
      }

      .button:focus-visible,
      .link:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 3px;
      }

      .footnote {
        margin: 18px 0 0;
        color: var(--muted);
        font-size: 0.88rem;
        line-height: 1.5;
      }

      @media (max-width: 720px) {
        .frame {
          grid-template-columns: 1fr;
        }

        .code-panel {
          min-height: 220px;
        }

        .content-panel {
          gap: 10px;
        }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <div class="frame">
        <section class="code-panel" aria-label="${status} error code">
          <div class="status">
            <p class="status-kicker">Client error</p>
            <p class="status-code">${status}</p>
            <span class="status-chip">${escapeHtml(title)}</span>
          </div>
        </section>
        <section class="content-panel" aria-labelledby="error-title">
          <div>
            <p class="eyebrow">Awesome Design Resources</p>
            <h1 id="error-title">${escapeHtml(title)}</h1>
            <p class="message">${escapeHtml(message)}</p>
            <div class="meta">
              <p class="path-label">Requested path</p>
              <span class="path">${escapedPath}</span>
            </div>
          </div>
          <div>
            <div class="actions">
              <a class="button" href="/">Go to home</a>
              <a class="link" href="https://github.com/GanymedeStation/design-resources" target="_blank" rel="noreferrer">
                View source
              </a>
            </div>
            <p class="footnote">
              If you arrived here from a link, the target may have moved or the request may need a different method.
            </p>
          </div>
        </section>
      </div>
    </main>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });
}
