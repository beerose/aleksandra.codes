import type { JSX } from "solid-js";
import { formatDate } from "./formatDate";
import grainSvg from "./GrainOverlay/grain.svg"

export interface CardProps {
  children: JSX.Element
  href: string
}

export function Card({href, children}: CardProps) {
  // todo: generate gradients
  return (
    <a href={href}>
      <div class="border border-gray-500 p-4" style={{
        background: `linear-gradient(100deg, #f1f8ff, white, white), url(${grainSvg})`
      }}>
        {children}
      </div>
    </a>
  );
}