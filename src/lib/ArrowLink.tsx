import type { JSX } from "solid-js";

export interface ArrowLinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
  title: string;
  href: string;
}

export function ArrowLink(props: ArrowLinkProps) {
  return (
    <div class="my-2 ml-1 group hover:translate-x-1 hover:underline underline-offset-4 decoration-gray-500 decoration-1 duration-100">
      <a
        class={"whitespace-nowrap rounded-sm before:rounded-sm relative text-xs text-gray-600 dark:text-gray-400 my-4 no-underline"}
        href={props.href}
      >
        <span >
        {props.title}
        </span>  
        <span> →</span>
      </a>
    </div>
  );
}
