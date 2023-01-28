import { assert } from "console";
import { Configuration, CreateEmbeddingResponse, OpenAIApi } from "openai";
import { PineconeClient } from "pinecone-client";
import { isRateLimitExceeded } from "./isRateLimitExceeded";
import { openaiEmbeddingModel, PineconeMetadata } from "./types";

export async function semanticQuery(query: string | null) {
  assert(process.env.OPENAI_API_KEY, "process.env.OPENAI_API_KEY is required");
  assert(
    process.env.PINECONE_API_KEY,
    "process.env.PINECONE_API_KEY is required"
  );
  assert(
    process.env.PINECONE_BASE_URL,
    "process.env.PINECONE_BASE_URL is required"
  );
  assert(
    process.env.PINECONE_NAMESPACE,
    "process.env.PINECONE_NAMESPACE is required"
  );

  if (!query || typeof query !== "string") {
    throw new Error(`Invalid query: ${query}`);
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

  console.log(`Creating embedding for query: ${query}...`);

  let embed: CreateEmbeddingResponse | null = null;
  try {
    embed = (
      await openai.createEmbedding({
        input: query,
        model: openaiEmbeddingModel,
      })
    ).data;
  } catch (err) {
    if (isRateLimitExceeded(err)) {
      throw new Error(
        "OpenAI rate limit exceeded. Try again in a few minutes."
      );
    }

    throw err;
  }

  if (!embed.data || !embed.data[0]) {
    throw new Error(`Error generating embedding for query: ${query}`);
  }

  const response = await pinecone.query({
    vector: embed.data[0].embedding,
    topK: 10,
    includeMetadata: true,
    includeValues: false,
  });

  return response;
}
