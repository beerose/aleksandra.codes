import strip from "remark-mdx-to-plain-text";

export const mdxToPlainText = async (rawContent: string) => {
  rawContent = rawContent.replace(/^---((.|\n)*)---/, "").replace(/\n/g, "");

  const remark = (await import("remark")).remark;
  const mdx = (await import("remark-mdx")).default;

  try {
    let res = "";
    remark()
      .use(mdx)
      .use(strip)
      .process(rawContent, function (err, file) {
        if (err) throw err;
        res = String(file).trim();
      });
    return res;
  } catch (err) {
    return rawContent;
  }
};
