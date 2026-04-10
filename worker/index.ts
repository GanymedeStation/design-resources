import resourceDataset from "../src/data/resources.json";
import { createClientErrorResponse } from "./errorPage";

type AssetFetcher = {
  fetch(request: Request): Promise<Response>;
};

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
};

type WorkerEnv = {
  ASSETS: AssetFetcher;
  CORS_ALLOWED_ORIGIN?: string;
};

function getJsonResponseHeaders(request: Request, allowedOrigin?: string) {
  const headers: Record<string, string> = { ...JSON_HEADERS };
  const origin = request.headers.get("origin");

  if (allowedOrigin && origin === allowedOrigin) {
    headers["access-control-allow-origin"] = origin;
    headers["access-control-allow-methods"] = "GET, HEAD, OPTIONS";
    headers["access-control-allow-headers"] = "content-type";
    headers["access-control-max-age"] = "86400";
    headers.vary = "Origin";
  }

  return headers;
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/resources.json") {
      const headers = getJsonResponseHeaders(request, env.CORS_ALLOWED_ORIGIN);

      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers,
        });
      }

      if (request.method === "HEAD") {
        return new Response(null, {
          headers,
        });
      }

      return new Response(JSON.stringify(resourceDataset), {
        headers,
      });
    }

    const response = await env.ASSETS.fetch(request);

    if (response.status >= 400 && response.status < 500) {
      return createClientErrorResponse(response.status, url, request.method);
    }

    return response;
  },
};
