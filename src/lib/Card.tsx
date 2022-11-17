import type { JSX } from "solid-js";

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
        class={`border h-full border-gray-500 dark:border-gray-500 p-4 flex flex-col`}
      >
        {children}
      </div>
    </a>
  );
}
