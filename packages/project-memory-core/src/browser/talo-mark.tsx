export function TaloMark({ size = 24, title }: { size?: number; title?: string }) {
  return (
    <svg
      aria-hidden={title ? undefined : true}
      aria-label={title}
      class="talo-mark"
      fill="none"
      height={size}
      role={title ? "img" : undefined}
      viewBox="0 0 64 64"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title && <title>{title}</title>}
      <path class="talo-mark-page" d="M15.5 12H48.5C49.9 12 51 13.1 51 14.5V18.5C51 19.9 49.9 21 48.5 21H40V49.5C40 50.9 38.9 52 37.5 52H26.5C25.1 52 24 50.9 24 49.5V21H15.5C14.1 21 13 19.9 13 18.5V14.5C13 13.1 14.1 12 15.5 12Z" />
      <path class="talo-mark-fold" d="M32 52H37.5C38.9 52 40 50.9 40 49.5V44L32 52Z" />
    </svg>
  );
}
