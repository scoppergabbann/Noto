import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function PageHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="mb-1.5 text-[12.5px] font-semibold uppercase tracking-[.12em] text-ink-faint">
          {eyebrow}
        </div>
        <h1 className="serif text-[26px] font-semibold leading-[1.1] tracking-tight sm:text-[34px]">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-2.5">
        <ThemeToggle />
        {action}
      </div>
    </div>
  );
}
