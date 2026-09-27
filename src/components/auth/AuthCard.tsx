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
      <div className="rounded-[30px] border border-[#E8EAEE] bg-white p-5 shadow-[0_18px_60px_rgba(16,24,40,.10)] dark:border-white/10 dark:bg-white/[.06] sm:p-7">
        <div className="mb-6">
          <div className="mb-3 hidden lg:block">
            <img
              src="/logo-noto-mark-transparent.png"
              alt="Noto"
              className="h-11 w-auto object-contain"
            />
          </div>

          <h2 className="text-[28px] font-extrabold text-[#18202B] dark:text-white">{title}</h2>
          <p className="mt-1 text-[14.5px] leading-6 text-[#858C97]">{subtitle}</p>
        </div>

        {children}
      </div>

      {bottomText && <p className="mt-5 text-center text-[12.5px] text-[#858C97]">{bottomText}</p>}
    </>
  );
}
