export function MobileHeader() {
  return (
    <div className="mb-5 flex items-center justify-between lg:hidden">
      <div className="flex items-center gap-2.5">
        <div className="serif grid h-8 w-8 place-items-center rounded-[9px] bg-gradient-to-br from-amber to-amber-deep text-[17px] font-bold text-white">
          L
        </div>
        <div className="serif text-lg font-semibold tracking-tight">Noto</div>
      </div>
      <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-sm font-semibold text-white">
        RA
      </div>
    </div>
  );
}
