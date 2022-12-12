import rss from "@astrojs/rss";

import type { PostFrontmatter, TalkFrontmatter } from "../types";

const postImportResult = import.meta.glob("../../posts/**/*.mdx", {
  eager: true,
});
const posts = Object.values(postImportResult) as {
  frontmatter: TalkFrontmatter | PostFrontmatter;
  readingTime: string;
  url: string;
}[];

export const get = () =>
  rss({
    // `<title>` field in output xml
    title: "aleksandra.codes",
    // `<description>` field in output xml
    description:
      "Aleksandra Sikora's blog on programming, and computer science",
    // base URL for RSS <item> links
    // SITE will use "site" from your project's astro.config.
    site: "https://aleksandra.codes",
    // list of `<item>`s in output xml
    // simple example: generate items for every md file in /src/pages
    // see "Generating items" section for required frontmatter and advanced use cases
    items: posts.map((post) => ({
      ...post.frontmatter,
      link: post.frontmatter.path,
      pubDate: new Date(post.frontmatter.date),
    })),
  });
