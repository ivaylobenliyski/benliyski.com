export default function Logo({
  size = 40,
  animate = false,
  variant = "light",
  className,
}: {
  size?: number;
  animate?: boolean;
  /** "light" = cream strokes for dark backgrounds, "dark" = green strokes for cream backgrounds */
  variant?: "light" | "dark";
  className?: string;
}) {
  return (
    <img
      src={variant === "dark" ? "/logo-dark.svg" : "/logo.svg"}
      alt=""
      width={size}
      height={size}
      className={className}
      style={{
        display: "block",
        ...(animate && {
          animation: "logoSpin 40s linear infinite",
          transformOrigin: "center",
        }),
      }}
    />
  );
}
