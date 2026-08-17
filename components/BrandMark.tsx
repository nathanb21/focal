export function BrandMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dimensions = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
  return (
    <span className={`flex ${dimensions} shrink-0 items-center justify-center`} aria-hidden="true">
      <img src="/focal-logo.svg" alt="" className="h-full w-full object-contain" />
    </span>
  );
}
