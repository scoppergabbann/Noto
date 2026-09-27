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
        <p className="mb-2 text-[12px] font-bold uppercase text-[#858C97]">{eyebrow}</p>
        <h1 className="text-[26px] font-extrabold leading-[1.12] text-[#18202B] dark:text-white sm:text-[34px]">
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
