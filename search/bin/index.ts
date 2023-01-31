import { assert } from "console";
import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";
import { PineconeClient } from "pinecone-client";
import { PineconeMetadata } from "../types";
import * as fs from "fs";
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

function args(argv: string[]) {
  argv = argv.slice(2);

  const parsedArgs: Record<string, string | number | boolean> = {};
  let argName: string;
  let argValue: string | number | boolean;

  argv.forEach(function (arg) {
    const match = arg.match(/([^=\s]+)=?\s*(.*)/);
    match?.splice(0, 1);

    if (!match || !match[0]) {
      return;
    }

    argName = match[0];

    if (argName.indexOf("-") === 0) {
      argName = argName.slice(argName.slice(0, 2).lastIndexOf("-") + 1);
    }

    if (match[1] && match[1] !== "") {
      argValue =
        parseFloat(match[1]).toString() === match[1] ? +match[1] : match[1];
    } else {
      argValue = true;
    }

    parsedArgs[argName] = argValue;
  });

  return parsedArgs;
}

async function main() {
  const parsedArgs = args(process.argv);
  const postsDir = parsedArgs["postsDir"] || parsedArgs["d"];
  if (!postsDir) {
    console.error(`\
Usage: zaduma-search --postsDir=<postDir>
Example: 
  zaduma-search --postDir=./posts
  zaduma-search -d=./posts`);
    process.exit(1);
  }
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
  const posts = fs.readdirSync(postsDir);
  for (const post of posts) {
    if (!post.endsWith(".mdx")) continue;

    console.log(`Processing post: ${post}...`);

    const rawContent = fs.readFileSync(`./posts/${post}`, "utf-8");
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

main().catch((err) => {
  console.error("error", err);
  process.exit(1);
});
