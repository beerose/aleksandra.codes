import { remarkMdxToPlainText } from "./plugin";

export const mdxToPlainText = async (rawContent: string) => {
  const remark = (await import("remark")).remark;
  const remarkFrontmatter = (await import("remark-frontmatter")).default;
  const remarkGfm = (await import("remark-gfm")).default;
  const remarkMdx = (await import("remark-mdx")).default;
  const remarkSmartypants = (await import("remark-smartypants")).default;

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
