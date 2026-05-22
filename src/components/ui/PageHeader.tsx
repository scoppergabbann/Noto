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
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-subtle mb-2 text-[12.5px] font-bold uppercase tracking-[.14em]">
          {eyebrow}
        </p>
        <h1 className="text-heading font-serif text-[26px] font-semibold leading-[1.08] tracking-tight sm:text-[34px]">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-2.5">
        <ThemeToggle />
        {action}
      </div>
    </header>
  );
}
