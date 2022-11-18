import type { JSX } from "solid-js";

export interface ArrowLinkProps
  extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
  title: string;
  href: string;
}

export function ArrowLink(props: ArrowLinkProps) {
  return (
    <a
      class={
        "hover:translate-x-1 hover:underline underline-offset-4 decoration-gray-500 decoration-1 decoration-wavy duration-100 whitespace-nowrap rounded-sm text-xs text-gray-600 dark:text-gray-400 my-4 no-underline " + props.class
      }
      href={props.href}
    >
      <span>{props.title}</span>
      <span> →</span>
    </a>
  );
}
