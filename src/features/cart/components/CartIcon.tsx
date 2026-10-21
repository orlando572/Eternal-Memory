import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";

type CartIconName = "cart" | "close" | "plus" | "minus" | "remove" | "arrow";

const mobileIcons = {
  cart: ShoppingBag,
  close: X,
  plus: Plus,
  minus: Minus,
  remove: Trash2,
  arrow: ArrowRight,
};
const mobileSizes = { cart: 38, close: 22, plus: 15, minus: 15, remove: 18, arrow: 18 };

export function CartIcon({ name }: { name: CartIconName }) {
  const MobileIcon = mobileIcons[name];
  return (
    <>
      <svg className="cart-icon-custom" width={name === "cart" ? 40 : name === "close" ? 22 : 18}
        height={name === "cart" ? 40 : name === "close" ? 22 : 18} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true" focusable="false">
        {name === "cart" && <><path d="M3 3h2l2.5 12h11L21 7H6M8 18h10" /><circle cx="9" cy="21" r="1" /><circle cx="18" cy="21" r="1" /></>}
        {name === "close" && <path d="m6 6 12 12M18 6 6 18" />}
        {name === "plus" && <path d="M5 12h14M12 5v14" />}
        {name === "minus" && <path d="M5 12h14" />}
        {name === "remove" && <><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6" /></>}
        {name === "arrow" && <path d="M4 12h15m-5-5 5 5-5 5" />}
      </svg>
      <MobileIcon className="cart-icon-original" size={mobileSizes[name]} strokeWidth={name === "cart" ? 1.25 : 2} aria-hidden="true" />
    </>
  );
}
