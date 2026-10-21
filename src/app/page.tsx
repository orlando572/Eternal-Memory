"use client";

import Link from "next/link";
import { Amphora, ArrowRight, Flower2, Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/features/cart/context/CartContext";
import { PRODUCTOS } from "@/features/products/data/productsData";
import { Button } from "@/components/ui/button";

const featured = PRODUCTOS.find((item) => item.id === "urna-serenidad-bronce")!;
const urns = ["urna-marmol-silencioso", "urna-organica-tierra", "urna-roble-americano"].map(
  (id) => PRODUCTOS.find((item) => item.id === id)!,
);
const urnImages = [
  "/assets/plates/product-marble-photo.png",
  "/assets/plates/product-organic-photo.png",
  "/assets/plates/product-oak-photo.png",
];

export default function HomePage() {
  const { addToCart } = useCart();

  return (
    <div className="home-first-view">
      <section className="home-hero" aria-label="Selección de productos funerarios">
        <img className="home-stucco" src="/assets/plates/stucco.png" alt="" />
        <img className="home-patio" src="/assets/plates/patio-view.png" alt="Patio soleado visto a través de un umbral" />

        <div className="home-intro">
          <p className="home-kicker">Un último homenaje, siempre presente</p>
          <h1>Elegir con calma</h1>
          <p className="home-subtitle">Productos funerarios para honrar a quienes amamos.</p>
          <div className="home-categories" aria-label="Categorías">
            <Button asChild className="selected"><Link href="/catalogo?categoria=urnas"><Amphora size={22} strokeWidth={1.5} /> Urnas</Link></Button>
            <Button asChild variant="outline"><Link href="/catalogo?categoria=ataudes">Ataúdes</Link></Button>
            <Button asChild variant="outline"><Link href="/catalogo?categoria=flores"><Flower2 size={22} strokeWidth={1.5} /> Arreglos florales</Link></Button>
            <Button asChild variant="outline"><Link href="/catalogo?categoria=relicarios"><Heart size={24} strokeWidth={1.5} /> Relicarios</Link></Button>
          </div>
        </div>

        <div className="home-feature">
          <img className="home-feature-photo" src="/assets/plates/featured-photo.png" alt="Imagen referencial de la Urna Serenidad en bronce" />
          <div className="home-feature-info">
            <h2>{featured.nombre}</h2>
            <p>Diseño sobrio en bronce pulido, con acabado mate y cierre hermético de alta seguridad.</p>
            <strong>{featured.precio}</strong>
            <Button asChild><Link href={`/catalogo/${featured.id}`}>Ver producto <ArrowRight size={18} /></Link></Button>
          </div>
        </div>
      </section>
      <section className="home-products" aria-labelledby="home-products-title">
        <div className="home-products-intro">
          <p className="home-kicker">Nuestras urnas</p>
          <h2 id="home-products-title">Diseños para<br />cada historia</h2>
          <p>Urnas en diversos materiales, estilos y tamaños, pensadas para conservar un recuerdo especial.</p>
          <Link href="/catalogo?categoria=urnas">Ver todas las urnas <ArrowRight size={19} /></Link>
        </div>
        <div className="home-product-list">
          {urns.map((item, index) => (
            <article className="home-product-card" key={item.id}>
              <Link href={`/catalogo/${item.id}`} aria-label={`Ver ${item.nombre}`}>
                <img src={urnImages[index]} alt={`Imagen referencial de ${item.nombre}`} />
              </Link>
              <div className="home-product-meta">
                <Link href={`/catalogo/${item.id}`}>{item.nombre}</Link>
                <div><strong>{item.precio}</strong><Button size="icon" type="button" aria-label={`Añadir ${item.nombre} al carrito`} onClick={() => addToCart({ ...item, selectedOption: item.opciones?.[0] ?? "", quantity: 1 })}><ShoppingCart size={17} /></Button></div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
