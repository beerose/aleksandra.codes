import type { OpenAIApi } from "openai";

import {
  MAX_INPUT_TOKENS,
  PineconeVector,
  PineconeVectorPending,
  PostContent,
} from "./types";
import { openaiEmbeddingModel } from "./types";

export async function getEmbeddingsForPostContent({
  content,
  id,
  title,
  openai,
  model = openaiEmbeddingModel,
  maxInputTokens = MAX_INPUT_TOKENS,
}: // concurrency = 4,
{
  content: PostContent;
  title: string;
  id: string;
  openai: OpenAIApi;
  model?: string;
  maxInputTokens?: number;
  concurrency?: number;
}) {
  const pendingVectors: PineconeVectorPending[] = [];
  let currentStart = 0;
  let currentEnd = 0;
  let currentNumTokensEstimate = 0;
  let currentInput = "";
  let currentPartIndex = 0;
  let currentVectorIndex = 0;
  let isDone = false;

  const chunks = content.chunks;

  do {
    isDone = currentPartIndex >= chunks.length;

    const part = chunks[currentPartIndex];
    if (!part) {
      break;
    }
    const text = part?.text.trim() || ""; // TODO: do more stuff here
    const numTokens = getNumTokensEstimate(text);

    if (!isDone && currentNumTokensEstimate + numTokens < maxInputTokens) {
      if (!currentStart) {
        currentStart = part?.start;
      }

      if (!currentEnd) {
        currentEnd = part?.end;
      }

      currentNumTokensEstimate += numTokens;
      currentInput = `${currentInput} ${text}`;

      ++currentPartIndex;
    } else {
      currentInput = currentInput.trim();
      if (isDone && !currentInput) {
        break;
      }

      const currentVector: PineconeVectorPending = {
        id: `${id}:${currentVectorIndex++}`,
        input: currentInput,
        metadata: {
          id,
          title,
          text: currentInput,
          end: part?.end,
          start: currentStart,
        },
      };

      pendingVectors.push(currentVector);

      // reset current batch
      currentNumTokensEstimate = 0;
      currentStart = 0;
      currentEnd = 0;
      currentInput = "";
    }
  } while (!isDone);

  const vectors: PineconeVector[] = [];

  for (const pendingVector of pendingVectors) {
    const { data: embed } = await openai.createEmbedding({
      input: pendingVector.input,
      model,
    });

    const vector: PineconeVector = {
      id: pendingVector.id,
      metadata: pendingVector.metadata,
      values: embed.data[0]?.embedding || [],
    };

    vectors.push(vector);
  }

  return vectors;
}

function getNumTokensEstimate(input: string): number {
  const numTokens = (input || "")
    .split(/\s/)
    .map((token) => token.trim())
    .filter(Boolean).length;

  return numTokens;
}
