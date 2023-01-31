import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkSmartypants from "remark-smartypants";

import { remarkMdxToPlainText } from "./plugin";

export const mdxToPlainText = async (rawContent: string) => {
  try {
    const vfile = await remark()
      .use(remarkFrontmatter)
      .use(remarkSmartypants)
      .use(remarkGfm)
      .use(remarkMdx)
      .use(remarkMdxToPlainText)
      .process(rawContent);

    return vfile.value.toString().trim();
  } catch (err) {
    return rawContent;
  }
};
