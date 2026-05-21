export function ProgressBar({
  value,
  color,
  height = 8,
}: {
  value: number; // 0..100
  color: string;
  height?: number;
}) {
  return (
    <div
      className="overflow-hidden rounded-full bg-black/[.07] dark:bg-white/10"
      style={{ height }}
    >
      <span
        className="block h-full rounded-full transition-[width] duration-700"
        style={{ width: `${Math.min(100, value)}%`, background: color }}
      />
    </div>
  );
}
