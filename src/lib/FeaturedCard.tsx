import type { JSX } from "solid-js";
import { formatDate } from "./formatDate";

export interface CardProps {
  tags: string[];
  title: string;
  date: Date;
  href: string;
  description: string;
  readLength: string;
  links?: JSX.Element;
}

export function FeaturedCard(props: CardProps) {
  return (
    <div class="border border-gray-500 p-4">

      <h3 class="font-semibold mb-1">{props.title}</h3>
      <div class="flex space-x-1 text-gray-600 dark:text-gray-400 text-xs">
        <time
          datetime={props.date.toISOString()}
        >
          {formatDate(props.date)}
        </time>
        <span>·</span>
        <p>{props.readLength}</p>
      </div>
      <p class="mt-2 text-sm">{props.description}</p>
      <div>{props.links}</div>
      <div class="flex flex-row space-x-2 mt-3">
      {props.tags.map((tag) => (
        <span class="text-xs tracking-wide text-gray-700 border border-gray-500 px-1">
          {tag}
        </span>
      ))}
      </div>
    </div>
  );
}