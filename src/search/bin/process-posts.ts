import { assert } from "console";
import * as fs from "fs";

import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";
import { PineconeClient } from "pinecone-client";

import { BLOG_NAME, PineconeMetadata, PostDetails } from "../types";
import { upsertPostsContent } from "../upsertPostsContent";

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

  const { items }: { items: PostDetails[] } = JSON.parse(
    fs.readFileSync(`./${BLOG_NAME}.json`, "utf-8")
  );

  await upsertPostsContent(items, {
    openai,
    pinecone,
  });
}

main().catch((err) => {
  console.error("error", err);
  process.exit(1);
});
