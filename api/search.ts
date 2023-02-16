import {
  type SemanticSearchMetadata,
  semanticQuery,
} from "@beerose/semantic-search";
import { Configuration, OpenAIApi } from "openai";
import { PineconeClient } from "pinecone-client";

export default async function search(request: Request, response: any) {
  try {
    const searchParams = new URLSearchParams(
      request.url.slice(request.url.indexOf("?"))
    );
    const query = searchParams.get("q");

    const openai = new OpenAIApi(
      new Configuration({
        apiKey: process.env.OPENAI_API_KEY as string,
      })
    );

    const pinecone = new PineconeClient<SemanticSearchMetadata>({
      apiKey: process.env.PINECONE_API_KEY as string,
      baseUrl: process.env.PINECONE_BASE_URL as string,
      namespace: process.env.PINECONE_NAMESPACE as string,
    });

    const result = await semanticQuery(query || "", openai, pinecone);

    const matchedPosts = result.matches.map((match) => ({
      path: match.metadata.id,
      score: match.score,
      title: match.metadata.title,
    }));

    const uniquePosts: typeof matchedPosts = [];
    for (const post of matchedPosts) {
      if (!uniquePosts.some((uniquePost) => uniquePost.path === post.path)) {
        uniquePosts.push(post);
      }
    }

    await response.send(uniquePosts);
  } catch (err: unknown) {
    console.error(err);

    const error = err instanceof Error ? err : new Error(String(err));

    await response.status(500).send(error.message);
  }
}
