import { Chunk, MAX_INPUT_TOKENS } from "./types";

export const splitIntoChunks = (
  content: string,
  maxInputTokens = MAX_INPUT_TOKENS
) => {
  const chunks: Chunk[] = [];
  let chunk = {
    text: [] as string[],
    start: 0,
    end: 0,
  };
  let start = 0;

  const words = content.split(" ");

  for (const word of words) {
    const newChunkText = [...chunk.text, word];
    if (newChunkText.join(" ").length > maxInputTokens) {
      const chunkLength = chunk.text.join(" ").length;
      chunks.push({
        text: chunk.text.join(" "),
        start,
        end: start + chunkLength,
      });
      start += chunkLength + 1;
      chunk = {
        text: [],
        start,
        end: start,
      };
    }
    chunk = {
      ...chunk,
      text: [...chunk.text, word],
    };
  }
  chunks.push({
    ...chunk,
    text: chunk.text.join(" "),
  });

  return chunks;
};
