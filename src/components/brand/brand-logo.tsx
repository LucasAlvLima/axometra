import Image from "next/image";

type BrandLogoProps = {
  variant?: "horizontal" | "stacked" | "symbol-only";
  compact?: boolean;
  className?: string;
};

export function BrandLogo({ variant = "horizontal", compact = false, className = "" }: BrandLogoProps) {
  if (variant === "symbol-only") {
    return (
      <Image
        src="/brand/axometra-symbol.png"
        alt="AXOMETRA — Performance Intelligence"
        width={512}
        height={512}
        sizes="48px"
        className={`h-12 w-12 shrink-0 object-contain ${className}`}
      />
    );
  }

  const stacked = variant === "stacked";
  return (
    <span className={`${stacked ? "flex flex-col items-center gap-3 text-center" : "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-left"} ${className}`}>
      <Image
        src="/brand/axometra-symbol.png"
        alt=""
        width={512}
        height={512}
        sizes={stacked ? "(min-width: 640px) 96px, 80px" : "(min-width: 1024px) 40px, 32px"}
        className={stacked ? "h-20 w-20 shrink-0 object-contain sm:h-24 sm:w-24" : "h-8 w-8 shrink-0 object-contain lg:h-10 lg:w-10"}
      />
      <span className={stacked ? "text-2xl font-semibold tracking-[0.2em] text-primary sm:text-3xl" : "text-base font-semibold tracking-[0.14em] text-primary"}>
        AXOMETRA
      </span>
      <span className={`${stacked ? "text-xs tracking-wide" : "basis-full text-xs"} ${compact && !stacked ? "hidden lg:block" : "block"} font-normal leading-relaxed text-muted`}>
        Performance Intelligence
      </span>
    </span>
  );
}
