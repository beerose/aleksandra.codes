import type { JSX } from "solid-js";

export interface ArrowLinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
  title: string;
  href: string;
}

export function ArrowLink(props: ArrowLinkProps) {
  return (
    <div class="my-2 ml-1 group hover:translate-x-1 hover:underline underline-offset-2 decoration-1 decoration-gray-400 duration-100">
      <a
        class={"whitespace-nowrap rounded-sm before:rounded-sm relative text-xs text-gray-600 my-4 no-underline group-hover:underline underline-offset-2 decoration-1 decoration-gray-400 duration-100"}
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
