import { assert, describe, it } from "vitest";

import { mdxToPlainText } from "./mdxToPlainText";

describe("mdxToPlainText", () => {
  it("should remove ###", async () => {
    const rawInput = "### Hello World";
    const output = await mdxToPlainText(rawInput);
    assert.equal(output, "Hello World");
  });

  it("should handle _, **, and ``", async () => {
    const rawInput = "Some _emphasis_, **importance**, and `code`.";
    const expectedOutput = "Some emphasis, importance, and code.";
    const output = await mdxToPlainText(rawInput);
    assert.equal(output, expectedOutput);
  });

  it("should remove JSX elements", async () => {
    const rawInput = "Some _emphasis_, **importance**, and `code`.";
    const expectedOutput = "Some emphasis, importance, and code.";
    const output = await mdxToPlainText(rawInput);
    assert.equal(output, expectedOutput);
  });

  it("should remove code blocks", async () => {
    const rawInput = ["```", "Bagel", "```"].join("\n");
    const expectedOutput = "Bagel";
    const output = await mdxToPlainText(rawInput);
    assert.equal(output, expectedOutput);
  });

  it("should remove frontmatter", async () => {
    const rawInput = ["---", "title: Hello World", "---", "Hello"].join("\n");
    const expectedOutput = "Hello";
    const output = await mdxToPlainText(rawInput);
    assert.equal(output, expectedOutput);
  });
});
