export function ProgressBar({
  value,
  color,
  height = 8,
  label,
}: {
  value: number;
  color: string;
  height?: number;
  label?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `${clamped}%`}
      className="overflow-hidden rounded-full bg-black/[.07] dark:bg-white/10"
      style={{ height }}
    >
      <span
        className="block h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${clamped}%`, background: color }}
      />
    </div>
  );
}
