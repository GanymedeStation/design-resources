import resourceDataset from "../src/data/resources.json";
import { createClientErrorResponse } from "./errorPage";

type AssetFetcher = {
  fetch(request: Request): Promise<Response>;
};

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
};

export default {
  async fetch(request: Request, env: { ASSETS: AssetFetcher }): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/resources.json") {
      if (request.method === "HEAD") {
        return new Response(null, { headers: JSON_HEADERS });
      }

      return new Response(JSON.stringify(resourceDataset), {
        headers: JSON_HEADERS,
      });
    }

    const response = await env.ASSETS.fetch(request);

    if (response.status >= 400 && response.status < 500) {
      return createClientErrorResponse(response.status, url, request.method);
    }

    return response;
  },
};
