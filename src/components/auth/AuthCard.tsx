"use client";

export function AuthCard({
  title,
  subtitle,
  children,
  bottomText,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  bottomText?: string;
}) {
  return (
    <>
      <div className="rounded-[28px] border border-black/[.07] bg-[#fffdf8]/95 p-5 shadow-[0_24px_80px_rgba(15,23,42,.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[.06] sm:p-7">
        <div className="mb-6">
          <div className="mb-3 hidden lg:block">
            <img
              src="/logo-noto-mark-transparent.png"
              alt="Noto"
              className="h-11 w-auto object-contain"
            />
          </div>

          <h2 className="text-heading font-serif text-[28px] font-semibold tracking-[-0.03em]">
            {title}
          </h2>
          <p className="text-muted mt-1 text-[14.5px] leading-6">{subtitle}</p>
        </div>

        {children}
      </div>

      {bottomText && (
        <p className="text-subtle mt-5 text-center text-[12.5px]">{bottomText}</p>
      )}
    </>
  );
}