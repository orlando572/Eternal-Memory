"use client";

import { Children, isValidElement, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "./Loading";

export function LoadingButton({ busy = false, busyLabel = "Procesando", children, disabled, className = "", ...props }: ComponentProps<typeof Button> & { busy?: boolean; busyLabel?: string }) {
  const items = Children.toArray(children);
  const iconIndex = items.findIndex((child) => isValidElement(child) && typeof child.type !== "string");
  return <Button {...props} className={`loading-button ${className}`} disabled={disabled || busy} aria-busy={busy}>
    {iconIndex < 0 && <span className="loading-button-icon">{busy && <Spinner />}</span>}
    {items.map((child, index) => busy && index === iconIndex ? <Spinner key="busy-icon" /> : child)}
    <span className="sr-only" role="status">{busy ? busyLabel : ""}</span>
  </Button>;
}
