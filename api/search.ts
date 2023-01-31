import { semanticQuery } from "../search/semanticQuery";

export default async function search(request: Request, response: any) {
  try {
    const searchParams = new URLSearchParams(
      request.url.slice(request.url.indexOf("?"))
    );
    const query = searchParams.get("q");

    const result = await semanticQuery(query);

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
