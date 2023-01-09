import { assert, describe, it } from "vitest";

import { stripMdx } from "./stripMdx";

describe("stripMdx", () => {
  it("should remove ###", () => {
    const rawInput = "### Hello World";
    const output = stripMdx(rawInput);
    assert.equal(output, "Hello World");
  });

  it("should remove ### and handle multiple lines", () => {
    const rawInput = `\
# Hello World
This is a test
## This is a test
### This is a test
`;
    const output = stripMdx(rawInput);
    assert.equal(
      output,
      `\
Hello World
This is a test
This is a test
This is a test
`
    );
  });
});
