import type { ReadTimeResults } from "reading-time";

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
  img: string;

  /**
   * @computed by defaultLayoutPlugin
   */
  layout?: string;
  /**
   * @computed by urlOutsideOfPagesDirPlugin
   */
  readingTime: ReadTimeResults;
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
