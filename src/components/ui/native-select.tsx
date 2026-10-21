import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function NativeSelect({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <span className="relative block w-full">
      <select
        data-slot="native-select"
        className={cn(
          "h-11 w-full appearance-none rounded-md border border-[#cbbeb5] bg-[#fffdfb] px-3.5 pr-10 text-sm text-[#171717] shadow-xs outline-none transition-colors focus-visible:border-[#a6533b] focus-visible:ring-[3px] focus-visible:ring-[#a6533b]/20 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-[#9a382a] aria-invalid:ring-[#9a382a]/15",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#655e5a]" />
    </span>
  );
}

export { NativeSelect };
