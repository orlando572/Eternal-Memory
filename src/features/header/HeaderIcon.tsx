type HeaderIconName = "search" | "account" | "cart" | "chevron";

export function HeaderIcon({ name }: { name: HeaderIconName }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {name === "search" && <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></>}
      {name === "account" && <><circle cx="12" cy="7.5" r="3.5" /><path d="M4.5 21v-2a7.5 7.5 0 0 1 15 0v2" /></>}
      {name === "cart" && <><path d="M3 3h2l2.5 12h11L21 7H6M8 18h10" /><circle cx="9" cy="21" r="1" /><circle cx="18" cy="21" r="1" /></>}
      {name === "chevron" && <path d="m8 10 4 4 4-4" />}
    </svg>
  );
}
