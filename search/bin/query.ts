import cac from "cac";
import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";
import { PineconeClient } from "pinecone-client";

import { semanticQuery } from "../semanticQuery";
import { PineconeMetadata } from "../types";

dotenv.config();

async function main(query: string) {
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

  const response = semanticQuery(query || "Hello world", openai, pinecone);

  console.log(JSON.stringify(response, null, 2));
}

const cli = cac("@beerose/semantic-search");

cli
  .command("search <query>", "Search by a given query")
  .example("search 'Hello world'")
  .action(async (query) => {
    await main(query).catch((err) => {
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
