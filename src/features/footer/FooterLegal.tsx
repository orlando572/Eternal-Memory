"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { footerLegal } from "./footerContent";

export function FooterLegal() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const [selected, setSelected] = useState(footerLegal[0]);

  function close() { dialog.current?.close(); }

  return <>
    <nav className="footer-legal" aria-label="Información legal">
      {footerLegal.map((document) => <button key={document.id} type="button" aria-haspopup="dialog" onClick={(event) => {
        trigger.current = event.currentTarget;
        setSelected(document);
        dialog.current?.showModal();
        dialog.current?.scrollTo(0, 0);
      }}>{document.label}</button>)}
    </nav>
    <dialog ref={dialog} className="footer-legal-dialog" aria-labelledby="footer-legal-title" onClose={() => trigger.current?.focus()} onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
    }}>
      <div className="footer-legal-dialog-header"><p>Eternal Memory</p><Button type="button" variant="ghost" size="icon" onClick={close} aria-label="Cerrar información legal" autoFocus><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></Button></div>
      <div className="footer-legal-dialog-content"><h2 id="footer-legal-title">{selected.title}</h2><p>{selected.intro}</p>{selected.sections.map((section) => <section key={section.title}><h3>{section.title}</h3><p>{section.text}</p></section>)}</div>
    </dialog>
  </>;
}
