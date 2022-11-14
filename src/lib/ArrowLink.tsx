import type { JSX } from "solid-js";

export interface ArrowLinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
  title: string;
  noUnderline?: boolean;
}

export function ArrowLink(props: ArrowLinkProps) {
  return (
    <a
      class={"group cursor-pointer whitespace-nowrap rounded-sm before:rounded-sm relative text-xs text-gray-600 my-4 no-underline hover:underline underline-offset-2 decoration-1 decoration-gray-400"}
    >
      {props.title}
      <span class="transition transform group-hover:-translate-x-6 motion-reduce:transition-none motion-reduce:group-hover:transform-none group-hover:ml-0"> →</span>
    </a>
  );
}
