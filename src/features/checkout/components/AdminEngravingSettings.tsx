"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminEngravingSettings as Settings } from "@/features/checkout/services/adminEngravingService";
import "@/features/checkout/admin-engraving.css";

async function requestSettings(body?: { pricePen: string; expectedPricePen: string }): Promise<Settings> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch("/api/admin/grabado", { method: body ? "PATCH" : "GET", cache: "no-store", credentials: "same-origin", headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined, signal: controller.signal });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "No se pudo consultar la configuración del grabado.");
    return data as Settings;
  } catch (error) {
    if (error instanceof Error && error.name !== "AbortError" && !(error instanceof TypeError)) throw error;
    throw new Error("No recibimos la respuesta. Carga el precio actual para comprobar si se guardó el cambio.");
  } finally { clearTimeout(timer); }
}

export function AdminEngravingSettings({ categoryId }: { categoryId: string }) {
  const [current, setCurrent] = useState<Settings | null>(null);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const saveLock = useRef(false);

  useEffect(() => {
    let active = true;
    void requestSettings().then((data) => {
      if (active) { setCurrent(data); setPrice(data.pricePen); setError(null); }
    }).catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : "No se pudo cargar el precio."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!current || saveLock.current || loading) return;
    saveLock.current = true;
    setSaving(true); setError(null); setSuccess(null);
    try {
      const updated = await requestSettings({ pricePen: price, expectedPricePen: current.pricePen });
      setCurrent(updated); setPrice(updated.pricePen);
      setSuccess(`Precio guardado: S/ ${updated.pricePen} por urna personalizada.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo guardar el precio.");
    } finally { setSaving(false); saveLock.current = false; }
  }

  if (!categoryId) return null;
  if (!current) return error ? <div className="engraving-settings"><p role="alert" className="engraving-settings-error">{error}</p><Button type="button" variant="outline" disabled={loading} onClick={() => { setLoading(true); setReload((value) => value + 1); }}>{loading ? "Cargando…" : "Reintentar configuración del grabado"}</Button></div> : null;
  if (current.categoryId !== categoryId) return null;

  return <section className="engraving-settings" aria-labelledby="engraving-settings-title" id="configuracion-grabado">
    <div className="engraving-settings-panel">
      <header><h2 id="engraving-settings-title">Configuración del grabado</h2><p>Define el precio del grabado para todas las urnas.</p></header>
      {loading && <p role="status">Cargando precio del grabado…</p>}
      {error && <p className="engraving-settings-error" role="alert" id="engraving-settings-error">{error}</p>}
      {success && <p className="engraving-settings-success" role="status">{success}</p>}
      {current && <form onSubmit={save} aria-busy={saving}>
        <div><label htmlFor="engraving-price">Precio adicional por urna (S/)</label><Input id="engraving-price" inputMode="decimal" value={price} onChange={(event) => { setPrice(event.target.value); setSuccess(null); }} required maxLength={13} disabled={loading || saving} aria-describedby={error ? "engraving-settings-error" : undefined} /></div>
        <Button type="submit" disabled={saving || loading}>{saving ? "Guardando…" : "Guardar precio del grabado"}</Button>
      </form>}
      {!loading && <Button type="button" variant="ghost" disabled={saving} onClick={() => { setLoading(true); setSuccess(null); setReload((value) => value + 1); }}>Cargar precio actual</Button>}
      {current && !current.active && <p className="engraving-settings-error">El grabado está desactivado actualmente. Guardar el precio no lo activará.</p>}
    </div>
  </section>;
}
