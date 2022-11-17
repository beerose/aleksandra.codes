import type { MarkdownHeading, MarkdownLayoutProps } from "astro";
import type { ReadTimeResults } from "reading-time";

export interface PostFrontmatter {
  /**
   * @computed by derivedTitleAndDatePlugin from file name
   *           if not given
   */
  title: string;
  /**
   * @computed by derivedTitleAndDatePlugin from git commit time
   *           if not given
   */
  date: string;
  tags: string;

  excerpt: string;
  featured?: boolean;

  /**
   * @computed by defaultLayoutPlugin
   */
  layout?: string;
  /**
   * @computed by urlOutsideOfPagesDirPlugin
   */
  path: string;
  /**
   * @computed by readingTimePlugin
   * @example
   * {
   *   text: '1 min read',
   *   minutes: 1,
   *   time: 60000,
   *   words: 200
   * }
   */
  readingTime: ReadTimeResults;
}

export interface TalkFrontmatter {
  /**
   * @computed by derivedTitleAndDatePlugin from file name
   *           if not given
   */
  title: string;
  /**
   * @computed by derivedTitleAndDatePlugin from git commit time
   *           if not given
   */
  date: string;
  tags: string;

  excerpt: string;
  featured?: boolean;
  type: "conference" | "meetup" | "workshop" | "podcast" | "other";
  event: string;
  duration: number;
  slides: string;
  video: string;
  youtubeId: string;
  place: string;

  /**
   * @computed by defaultLayoutPlugin
   */
  layout?: string;
  /**
   * @computed by urlOutsideOfPagesDirPlugin
   */
  path: string;
  /**
   * @computed by readingTimePlugin
   * @example
   * {
   *   text: '1 min read',
   *   minutes: 1,
   *   time: 60000,
   *   words: 200
   * }
   */
}

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
