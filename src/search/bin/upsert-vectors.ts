import { assert } from "console";
import * as fs from "fs";

import dotenv from "dotenv";
import { PineconeClient } from "pinecone-client";

import { PineconeMetadata } from "../types";

dotenv.config();

async function main() {
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

  const pinecone = new PineconeClient<PineconeMetadata>({
    apiKey: process.env.PINECONE_API_KEY as string,
    baseUrl: process.env.PINECONE_BASE_URL as string,
    namespace: process.env.PINECONE_NAMESPACE as string,
  });

  const vectors = fs.readdirSync("./vectors");

  for (const vector of vectors) {
    const { itemEmbeddings }: { itemEmbeddings: any[] } = JSON.parse(
      fs.readFileSync(`./vectors/${vector}`, "utf-8")
    );

    console.log(
      `Upserting ${itemEmbeddings.length} vectors for post: ${vector}...`
    );

    await pinecone.upsert({
      vectors: itemEmbeddings,
    });

    console.log(
      `Upserted ${itemEmbeddings.length} vectors for post: ${vector}`
    );
  }
}

main().catch((err) => {
  console.error("error", err);
  process.exit(1);
});
