import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";
import { PineconeClient } from "pinecone-client";

import { semanticQuery } from "../semanticQuery";
import { PineconeMetadata } from "../types";

dotenv.config();

async function main() {
  if (!globalThis.fetch) {
    await import("node-fetch").then(
      ({ default: fetch, Headers, Request, Response }) => {
        Object.assign(globalThis, { fetch, Headers, Request, Response });
      }
    );
  }

  const openai = new OpenAIApi(
    new Configuration({
      apiKey: process.env.OPENAI_API_KEY as string,
    })
  );

  const pinecone = new PineconeClient<PineconeMetadata>({
    apiKey: process.env.PINECONE_API_KEY as string,
    baseUrl: process.env.PINECONE_BASE_URL as string,
    namespace: process.env.PINECONE_NAMESPACE as string,
  });

  const response = semanticQuery(
    process.argv[1] || "Hello world",
    openai,
    pinecone
  );

  console.log(JSON.stringify(response, null, 2));
}

main().catch((err) => {
  console.error("error", err);
  process.exit(1);
});
