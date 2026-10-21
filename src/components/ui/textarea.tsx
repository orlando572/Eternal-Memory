import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-28 w-full resize-y rounded-md border border-[#cbbeb5] bg-[#fffdfb] px-3.5 py-3 text-sm text-[#171717] shadow-xs outline-none transition-colors placeholder:text-[#746b65] focus-visible:border-[#a6533b] focus-visible:ring-[3px] focus-visible:ring-[#a6533b]/20 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-[#9a382a] aria-invalid:ring-[#9a382a]/15",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
