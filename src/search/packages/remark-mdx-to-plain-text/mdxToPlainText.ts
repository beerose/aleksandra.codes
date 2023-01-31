import { remark } from "remark";
import remarkMdx from "remark-mdx";

import { remarkMdxToPlainText } from "./plugin";

export const mdxToPlainText = async (rawContent: string) => {
  try {
    const vfile = await remark()
      .use(remarkMdx)
      .use(remarkMdxToPlainText)
      .process(rawContent);

    return vfile.value.toString().trim();
  } catch (err) {
    return rawContent;
  }
};
