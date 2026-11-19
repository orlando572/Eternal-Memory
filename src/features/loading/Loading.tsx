import type { CSSProperties, ReactNode } from "react";

export function Skeleton({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <span className={`loading-skeleton ${className}`} style={style} aria-hidden="true" />;
}

export function Spinner({ className = "" }: { className?: string }) {
  return <svg className={`loading-spinner ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity=".2" /><path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}

export function LoadingIndicator({ label = "Cargando", className = "" }: { label?: string; className?: string }) {
  return <span className={`loading-indicator ${className}`} role="status"><Spinner /><span className="sr-only">{label}</span></span>;
}

export function LoadingRegion({ children, label = "Cargando", className = "" }: { children: ReactNode; label?: string; className?: string }) {
  return <div className={`loading-region ${className}`} role="status"><span className="sr-only">{label}</span><div aria-hidden="true">{children}</div></div>;
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return <div className="loading-form"><Skeleton className="loading-title" />{Array.from({ length: fields }, (_, index) => <div className="loading-field" key={index}><Skeleton className="loading-label" /><Skeleton className="loading-input" /></div>)}<Skeleton className="loading-action" /></div>;
}

export function CardSkeleton() {
  return <div className="loading-card"><Skeleton className="loading-card-photo" /><div className="loading-card-copy"><Skeleton className="loading-label" /><Skeleton className="loading-line" /><Skeleton className="loading-price" /></div></div>;
}
