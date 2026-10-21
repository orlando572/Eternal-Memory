import Image from "next/image";
import Link from "next/link";
import { FooterLegal } from "./FooterLegal";
import { footerContact } from "./footerContent";
import { FooterIcon } from "@/features/footer/FooterIcon";
import "@/features/footer/footer.css";

const catalogLinks = [
  { label: "Urnas", slug: "urnas" },
  { label: "Ataúdes", slug: "ataudes" },
  { label: "Arreglos florales", slug: "arreglos-florales" },
  { label: "Relicarios", slug: "relicarios" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer commerce-footer" aria-label="Pie de página">
      <div className="footer-main">
        <div className="footer-brand">
          <Link className="footer-logo" href="/" aria-label="Eternal Memory, inicio">
            <Image src="/assets/plates/logo.png" alt="Eternal Memory" width={307} height={58} />
          </Link>
          <p className="footer-brand-message">Un homenaje a su historia.<br />Una elección con calma.</p>
          <p className="footer-brand-description">Encuentra una forma personal de honrar y mantener cerca el recuerdo de quienes amas.</p>
          <span className="footer-signature">Con respeto, en cada detalle.</span>
        </div>

        <nav className="footer-column" aria-labelledby="footer-catalog-title">
          <h2 id="footer-catalog-title">Explora el catálogo</h2>
          <ul>
            {catalogLinks.map(({ label, slug }) => (
              <li key={slug}><Link href={`/catalogo?categoria=${slug}`}>{label}</Link></li>
            ))}
            <li><Link href="/catalogo">Ver todos los productos</Link></li>
          </ul>
        </nav>

        <nav className="footer-column" aria-labelledby="footer-account-title">
          <h2 id="footer-account-title">Tu cuenta</h2>
          <ul>
            <li><Link href="/perfil">Mi perfil</Link></li>
            <li><Link href="/perfil/historial">Mis pedidos</Link></li>
            <li><Link href="/login">Iniciar sesión</Link></li>
            <li><Link href="/registro">Crear una cuenta</Link></li>
          </ul>
        </nav>

        <section className="footer-column footer-support" aria-labelledby="footer-support-title">
          <h2 id="footer-support-title">Estamos para orientarte</h2>
          <p>Un espacio para resolver tus dudas y conocer las opciones a tu ritmo.</p>
          <ul className="footer-contact-list">
            <li><FooterIcon name="mail" /><div><span>Correo electrónico</span><p><a href={`mailto:${footerContact.email}`}>{footerContact.email}</a></p></div></li>
            <li><FooterIcon name="message" /><div><span>WhatsApp</span><p><a href={footerContact.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label={`Escribir por WhatsApp al ${footerContact.phone}, abre una pestaña nueva`}>{footerContact.phone}</a></p></div></li>
            <li><FooterIcon name="clock" /><div><span>Horario de atención</span><p>{footerContact.schedule}</p></div></li>
            <li><FooterIcon name="location" /><div><span>Encuéntranos</span><p>{footerContact.location}</p></div></li>
          </ul>
        </section>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Eternal Memory. Todos los derechos reservados.</p>
        <FooterLegal />
        <p className="footer-currency">Perú <span aria-hidden="true">·</span> PEN · S/</p>
      </div>
    </footer>
  );
}
