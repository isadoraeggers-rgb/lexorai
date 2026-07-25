import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-6", className)}
    >
      <rect width="32" height="32" rx="9" className="fill-accent" />
      <path
        d="M10 8.5C10 7.67157 10.6716 7 11.5 7C12.3284 7 13 7.67157 13 8.5V20.5H20.5C21.3284 20.5 22 21.1716 22 22C22 22.8284 21.3284 23.5 20.5 23.5H11.5C10.6716 23.5 10 22.8284 10 22V8.5Z"
        fill="white"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <LogoMark />
      <span>Lexora</span>
    </div>
  );
}
