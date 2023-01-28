import dotenv from "dotenv";

import { semanticQuery } from "../semanticQuery";

export const openaiEmbeddingModel = "text-embedding-ada-002";

dotenv.config();

async function main() {
  if (!globalThis.fetch) {
    await import("node-fetch").then(
      ({ default: fetch, Headers, Request, Response }) => {
        Object.assign(globalThis, { fetch, Headers, Request, Response });
      }
    );
  }

  const response = semanticQuery(process.argv[1] || "Hello world");

  console.log(JSON.stringify(response, null, 2));
}

main().catch((err) => {
  console.error("error", err);
  process.exit(1);
});
