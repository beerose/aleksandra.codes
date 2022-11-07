import type { JSX } from "solid-js";

export interface ArrowLinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
  title: string;
  href: string;
}

export function ArrowLink(props: ArrowLinkProps) {
  return (
      <a
        class={"ml-1 hover:translate-x-1 hover:underline underline-offset-4 decoration-gray-500 decoration-1 duration-100 whitespace-nowrap rounded-sm text-xs text-gray-600 dark:text-gray-400 my-4 no-underline"}
        href={props.href}
      >
        <span >
        {props.title}
        </span>  
        <span> →</span>
      </a>
  );
}
