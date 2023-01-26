import { assert } from "console";

import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";
import { PineconeClient } from "pinecone-client";

import type { PineconeMetadata } from "../types";

export const openaiEmbeddingModel = "text-embedding-ada-002";

dotenv.config();

async function main() {
  assert(process.env.OPENAI_API_KEY, "OPENAI_API_KEY is required");
  assert(process.env.PINECONE_API_KEY, "PINECONE_API_KEY is required");
  assert(process.env.PINECONE_BASE_URL, "PINECONE_BASE_URL is required");
  assert(process.env.PINECONE_NAMESPACE, "PINECONE_NAMESPACE is required");

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

  const query = process.argv[2] || "hello world";
  console.log(process.argv);
  const { data: embed } = await openai.createEmbedding({
    input: query,
    model: openaiEmbeddingModel,
  });

  if (!embed.data || !embed.data[0]) {
    throw new Error("no embedding found");
  }

  const res = await pinecone.query({
    vector: embed.data[0].embedding,
    topK: 10,
    includeMetadata: true,
    includeValues: false,
  });

  console.log(JSON.stringify(res, null, 2));
}

main().catch((err) => {
  console.error("error", err);
  process.exit(1);
});
