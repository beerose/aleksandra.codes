import "../global-styles/dots.css"

export function Dots(props: { className: string }) {
  return (
    <div class={`dots ${props.className} text-gray-800 dark:text-gray-400`}>
      <svg stroke="currentColor" width="10px" height="100%">
        <line
          stroke-width="2px"
          stroke-linecap="round"
          stroke-dasharray="0, 6"
          x1="1px"
          y1="1px"
          x2="1px"
          y2="100%"
        ></line>
      </svg>
    </div>
  );
}
