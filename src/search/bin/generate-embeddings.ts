import { assert } from "console";
import * as fs from "fs";

import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";

import { BLOG_NAME, PostDetails } from "../types";
import { getEmbeddingsForPostContent } from "../getEmbeddings";

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

  const { items }: { items: PostDetails[] } = JSON.parse(
    fs.readFileSync(`./${BLOG_NAME}.json`, "utf-8")
  );

  for (const item of items) {
    try {
      console.log(`Processing post: ${item.title}...`);
      const itemEmbeddings = await getEmbeddingsForPostContent({
        id: item.path,
        content: item.content,
        title: item.title,
        openai,
      });

      console.log(
        `Generated ${itemEmbeddings.length} vectors for post: ${item.title}`
      );

      fs.writeFileSync(
        `./vectors/${item.path}.json`,
        JSON.stringify({ itemEmbeddings }, null, 2),
        "utf-8"
      );
    } catch (err) {
      console.error(`Error processing post: ${item.title}`, err);
    }
  }
}

main().catch((err) => {
  console.error("error", err);
  process.exit(1);
});
