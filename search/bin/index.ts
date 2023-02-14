import { assert } from "console";
import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";
import { PineconeClient } from "pinecone-client";
import * as fs from "fs";
import glob from "tiny-glob";
import cac from "cac";

import type { PineconeMetadata } from "../types";
import { titleCase } from "../../src/lib/titleCase";
import { mdxToPlainText } from "../remark-mdx-to-plain-text/mdxToPlainText";
import { splitIntoChunks } from "../splitIntoChunks";
import { getEmbeddingsForPostContent } from "../getEmbeddings";

dotenv.config();

const getTitle = (content: string, path: string): string => {
  const title = /(?<=title: ).*/.exec(content)?.[0];
  if (title) {
    return title.replace(/"/g, "");
  }
  return titleCase(path.replace(/-/g, " ").replace(/\.mdx$/, ""));
};

async function main(postsDir: string) {
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

  console.log("Resolving posts...");
  const files = await glob(`${postsDir}/**/*.{mdx, md}`);
  console.log(`Found ${files.length} posts.`);
  for (const post of files) {
    if (!post.endsWith(".mdx") && !post.endsWith(".md")) continue;

    console.log(`Processing post: ${post}...`);

    const rawContent = fs.readFileSync(post, "utf-8");
    const title = getTitle(rawContent, post);
    const plainText = await mdxToPlainText(rawContent);

    const chunks = splitIntoChunks(plainText);
    console.log(`Split post "${title}" into ${chunks.length} chunks.`);

    console.log("Generating embeddings for post content...");
    const itemEmbeddings = await getEmbeddingsForPostContent({
      id: post,
      content: { chunks },
      title,
      openai,
    });
    console.log(
      `Generated ${itemEmbeddings.length} vectors for post: ${title}`
    );

    console.log(
      `Upserting ${itemEmbeddings.length} vectors for post: ${post}...`
    );
    await pinecone.upsert({
      vectors: itemEmbeddings,
    });
    console.log(`Upserted ${itemEmbeddings.length} vectors for post: ${post}`);

    console.log(`Finished processing post: ${post}.\n`);
  }
}

const cli = cac("@beerose/semantic-search");

cli
  .command(
    "index <dir>",
    "Process files with your content and upload them to Pinecone"
  )
  .example("index ./posts")
  .action(async (postsDir) => {
    await main(postsDir).catch((err) => {
      console.error(err);
      process.exit(1);
    });
  });

cli.help();

try {
  cli.parse(process.argv, { run: false });
  cli.runMatchedCommand();
} catch (error: any) {
  if (error.name === "CACError") {
    console.error(error.message + "\n");
    cli.outputHelp();
  } else {
    console.log(error.stack);
  }
  process.exit(1);
}
