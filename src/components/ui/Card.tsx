import { cn } from "@/lib/utils";

export function Card({
  className,
  hoverable,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hoverable?: boolean }) {
  return (
    <div className={cn("card", hoverable && "hoverable", className)} {...props}>
      {children}
    </div>
  );
}
