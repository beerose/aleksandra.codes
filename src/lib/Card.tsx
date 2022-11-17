import type { JSX } from "solid-js";

import grainSvg from "./GrainOverlay/grain.svg";

export interface CardProps {
  children: JSX.Element;
  href: string;
}

export function Card({ href, children }: CardProps) {
  // todo: generate gradients
  return (
    <a
      href={href}
      class="zaduma-hover-before transition-colors hover:decoration-transparent dark:hover:decoration-transparent"
    >
      <div
        class={`border h-full border-gray-500 dark:border-gray-500 p-4 bg-gradient-to-tr from-[#e8efff] dark:from-transparent to-gray-50 dark:to-[#161e24] bg-[url(${grainSvg})] flex flex-col`}
      >
        {children}
      </div>
    </a>
  );
}
