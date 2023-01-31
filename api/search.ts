import { Configuration, OpenAIApi } from "openai";
import { PineconeClient } from "pinecone-client";

import { semanticQuery } from "../search/semanticQuery";
import { PineconeMetadata } from "../search/types";

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

    const pinecone = new PineconeClient<PineconeMetadata>({
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

    await response.send(matchedPosts);
  } catch (err: unknown) {
    console.error(err);

    const error = err instanceof Error ? err : new Error(String(err));

    await response.status(500).send(error.message);
  }
}
