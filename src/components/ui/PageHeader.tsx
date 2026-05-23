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
    <header className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-7 lg:mb-8">
      <div>
        <p className="text-subtle mb-2 text-[12.5px] font-bold uppercase tracking-[.14em]">
          {eyebrow}
        </p>
        <h1 className="text-heading font-serif text-[26px] font-semibold leading-[1.08] tracking-tight sm:text-[34px]">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden lg:block">
          <ThemeToggle />
        </div>
        {action}
      </div>
    </header>
  );
}
