type FooterIconName = "mail" | "message" | "clock" | "location";

export function FooterIcon({ name }: { name: FooterIconName }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {name === "mail" && <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>}
      {name === "message" && <><path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.1A8.5 8.5 0 1 1 20.5 11.5Z" /><path d="M8 10h8M8 13h5" /></>}
      {name === "location" && <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.5" /></>}
      {name === "clock" && <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>}
    </svg>
  );
}
