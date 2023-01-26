import { Configuration, OpenAIApi } from "openai";
import { PineconeClient } from "pinecone-client";

import { openaiEmbeddingModel, PineconeMetadata } from "../search/types";

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_BASE_URL = process.env.PINECONE_BASE_URL;
const PINECONE_NAMESPACE = process.env.PINECONE_NAMESPACE;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function search(request: Request, response: any) {
  try {
    if (
      [
        PINECONE_API_KEY,
        PINECONE_BASE_URL,
        PINECONE_NAMESPACE,
        OPENAI_API_KEY,
      ].some((x) => !x)
    ) {
      throw new Error("env vars are missing");
    }

    const searchParams = new URLSearchParams(
      request.url.slice(request.url.indexOf("?"))
    );
    const query = searchParams.get("q");

    const openai = new OpenAIApi(
      new Configuration({ apiKey: OPENAI_API_KEY as string })
    );

    const pinecone = new PineconeClient<PineconeMetadata>({
      apiKey: PINECONE_API_KEY as string,
      baseUrl: PINECONE_BASE_URL as string,
      namespace: PINECONE_NAMESPACE as string,
    });

    if (!query || typeof query !== "string") {
      throw new Error(`invalid query: ${query}`);
    }

    console.log("creatingEmbedding for: ", query);
    const { data: embed } = await openai.createEmbedding({
      input: query,
      model: openaiEmbeddingModel,
    });
    console.log("created embedding: ", embed);

    if (!embed.data || !embed.data[0]) {
      throw new Error("no embedding found");
    }

    const result = await pinecone.query({
      vector: embed.data[0].embedding,
      topK: 10,
      includeMetadata: true,
      includeValues: false,
    });
    console.log("search result", result);

    await response.send(result);
  } catch (err: unknown) {
    console.error(err);

    const error = err instanceof Error ? err : new Error(String(err));

    await response.status(500).send(error.message);
  }
}
