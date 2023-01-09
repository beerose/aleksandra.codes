import type { APIRoute } from "astro";
import { Configuration, OpenAIApi } from "openai";
import { PineconeClient } from "pinecone-client";

import { openaiEmbeddingModel, PineconeMetadata } from "../search/types";

export const get: APIRoute = async function get({ request }) {
  // const data = await request.json();

  const query = "hello world";

  const openai = new OpenAIApi(
    new Configuration({
      apiKey: import.meta.env.OPENAI_API_KEY,
    })
  );

  const pinecone = new PineconeClient<PineconeMetadata>({
    apiKey: import.meta.env.PINECONE_API_KEY as string,
    baseUrl: import.meta.env.PINECONE_BASE_URL as string,
    namespace: import.meta.env.PINECONE_NAMESPACE as string,
  });

  if (!query || typeof query !== "string") {
    return {
      body: JSON.stringify({ error: `invalid query: ${query}` }),
    };
  }

  const { data: embed } = await openai.createEmbedding({
    input: query,
    model: openaiEmbeddingModel,
  });

  if (!embed.data || !embed.data[0]) {
    throw new Error("no embedding found");
  }

  const response = await pinecone.query({
    vector: embed.data[0].embedding,
    topK: 10,
    includeMetadata: true,
    includeValues: false,
  });

  return {
    body: JSON.stringify({ response }),
  };
};
