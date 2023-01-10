import type { OpenAIApi } from "openai";
import type { PineconeClient } from "pinecone-client";

import { getEmbeddingsForPostContent } from "./getEmbeddings";
import type { PineconeMetadata, PostDetails } from "./types";

export async function upsertPostsContent(
  items: PostDetails[],
  {
    openai,
    pinecone,
  }: // concurrency = 1,
  {
    openai: OpenAIApi;
    pinecone: PineconeClient<PineconeMetadata>;
    concurrency?: number;
  }
) {
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

      console.log(
        `Embeddings for post: ${item.title}`,
        JSON.stringify(itemEmbeddings, null, 2)
      );

      console.log(
        `Upserting ${itemEmbeddings.length} vectors for post: ${item.title}...`
      );

      await pinecone.upsert({
        vectors: itemEmbeddings,
      });
    } catch (err) {
      console.error(`Error processing post: ${item.title}`, err);
    }
  }
}
