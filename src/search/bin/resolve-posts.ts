import * as fs from "fs";

import { titleCase } from "../../lib/titleCase";
import { mdxToPlainText } from "../mdxToPlainText";
import { splitIntoChunks } from "../splitIntoChunks";
import type { PostDetails } from "../types";

const getTitle = (content: string, path: string) => {
  const title = /(?<=title: ).*/.exec(content)?.[0];
  if (title) {
    return title.replace(/"/g, "");
  }
  return titleCase(path.replace(/-/g, " ").replace(/\.mdx$/, ""));
};

async function main() {
  const posts = fs.readdirSync("./posts");

  const postDetails: PostDetails[] = [];
  for (const post of posts) {
    if (!post.endsWith(".mdx")) continue;
    console.log(`Processing post: ${post}...`);

    const rawContent = fs.readFileSync(`./posts/${post}`, "utf-8");
    const title = getTitle(rawContent, post);

    const plainText = await mdxToPlainText(rawContent);

    const chunks = splitIntoChunks(plainText);
    console.log(`Split post ${title} into ${chunks.length} chunks`);

    const postDetail = {
      title,
      path: post,
      content: {
        chunks,
      },
    };
    postDetails.push(postDetail);
  }

  fs.writeFileSync(
    `./aleksandra-codes.json`,
    JSON.stringify({ items: postDetails }, null, 2),
    "utf-8"
  );
}

main().catch((err) => {
  console.error("error", err);
  process.exit(1);
});
