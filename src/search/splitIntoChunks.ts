import { Chunk, MAX_INPUT_TOKENS } from "./types";

export const splitIntoChunks = (
  content: string,
  maxInputTokens = MAX_INPUT_TOKENS
) => {
  const chunks: Chunk[] = [];
  let chunk: Chunk = {
    text: "",
    start: 0,
    end: 0,
  };
  let chunkLength = 0;
  let start = 0;
  for (const line of content.split("")) {
    const lineLength = line.split(" ").length;
    if (chunkLength + lineLength > maxInputTokens) {
      chunks.push({
        text: chunk.text,
        start,
        end: start + chunkLength + lineLength - 1,
      });
      start += chunkLength + lineLength;
      chunk = {
        text: "",
        start,
        end: start,
      };
      chunkLength = 0;
    }
    chunk = {
      ...chunk,
      text: `${chunk.text}${line}`,
    };
    chunkLength += lineLength;
  }
  chunks.push(chunk);

  return chunks;
};
