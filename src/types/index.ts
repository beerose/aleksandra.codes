import type { MarkdownHeading, MarkdownLayoutProps } from "astro";

import type { PostFrontmatter } from "./PostFrontmatter";
export type { PostFrontmatter };

import type { TalkFrontmatter } from "./TalkFrontmatter";
export type { TalkFrontmatter };

interface BasePostProps {
  file: string;
  frontmatter: PostFrontmatter;
  /** We keep posts outside of pages/ directory,
   *  so we have to compute this URL manually.
   *  It's stored in `frontmatter.path`
   */
  url?: undefined;
  path: string;
}

/** @see https://docs.astro.build/en/guides/markdown-content/#markdown-layout-props */
type MarkdownPostProps = Omit<MarkdownLayoutProps<{}>, "frontmatter">;

/** @see https://docs.astro.build/en/guides/integrations-guide/mdx/#exported-properties */
type MDXPostProps = {
  getHeadings: () => MarkdownHeading[];
};

export type PostProps = BasePostProps & (MarkdownPostProps | MDXPostProps);
