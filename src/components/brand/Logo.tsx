type Props = {
  variant?: "mark" | "full";
  className?: string;
};

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sfa-bubble" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.62 0.22 258)" />
          <stop offset="100%" stopColor="oklch(0.48 0.20 258)" />
        </linearGradient>
      </defs>
      <path
        d="M8 6h20a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6h-9.5l-6.2 5.1a1 1 0 0 1-1.6-.78V32H8a6 6 0 0 1-6-6V12a6 6 0 0 1 6-6Z"
        fill="url(#sfa-bubble)"
      />
      <path
        d="M14.5 20.5l3.2 3.2 7.8-8.4"
        stroke="oklch(0.86 0.17 90)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function Logo({ variant = "full", className }: Props) {
  if (variant === "mark") return <LogoMark className={className} />;
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark className="h-8 w-8 shrink-0" />
      <span className="font-display text-[15px] font-semibold leading-none tracking-tight">
        support<span className="text-[oklch(0.86_0.17_90)]">FAQ</span>agent
      </span>
    </div>
  );
}
