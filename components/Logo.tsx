export default function Logo({
  size = 40,
  animate = false,
}: {
  size?: number;
  animate?: boolean;
}) {
  return (
    <img
      src="/logo.svg"
      alt="Benliyski logo"
      width={size}
      height={size}
      style={{
        display: "block",
        ...(animate && {
          animation: "logoSpin 20s linear infinite",
          transformOrigin: "center",
        }),
      }}
    />
  );
}
