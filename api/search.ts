import { semanticQuery } from "../search/semanticQuery";

export default async function search(request: Request, response: any) {
  try {
    const searchParams = new URLSearchParams(
      request.url.slice(request.url.indexOf("?"))
    );
    const query = searchParams.get("q");

    const result = await semanticQuery(query);

    await response.send(result);
  } catch (err: unknown) {
    console.error(err);

    const error = err instanceof Error ? err : new Error(String(err));

    await response.status(500).send(error.message);
  }
}
