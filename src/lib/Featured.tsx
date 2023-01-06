import type { JSX } from "solid-js";

import { Card } from "./Card";
import { formatDate } from "./formatDate";

import "../global-styles/clamp.css"

export type FeaturedProps = {
  title: string;
  tags: string[];
  date: Date;
  href: string;
  description?: string;
  length: string;
} & (
  | {
      type: "post";
      postType?: "guide" | "article" | "case-study";
    }
  | {
      type: "speaking";
      location: string;
      eventType: string;
      links?: JSX.Element;
    }
);

export function Featured({
  date,
  title,
  length,
  href,
  description,
  tags,
  ...rest
}: FeaturedProps) {
  return (
    <Card href={href}>
      <h2 class="font-semibold mb-1">{title}</h2>
      <div class="flex space-x-1 text-gray-600 dark:text-gray-400 text-xs">
        <time datetime={date.toISOString()}>{formatDate(date)}</time>
        <span>·</span>
        <p>{length}</p>
      </div>
      {description && <p class="mt-2 text-sm clamp">{description}</p>}
      {"links" in rest && <div>{rest.links}</div>}
      <div class="flex flex-row space-x-2 mt-auto">
        {tags.map((tag) => (
          <span class="text-xs tracking-wide text-gray-600 dark:text-gray-300 mt-2">
            #{tag.trim()}
          </span>
        ))}
      </div>
    </Card>
  );
}
