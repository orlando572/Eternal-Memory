import Link from "next/link";
import Image from "next/image";
import {
  Truck,
  PenTool,
  ShieldCheck,
  MessageCircle,
  ArrowRight,
  MessageSquareQuote,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col bg-ink text-bone">
      {/* ================= HERO / HEADER SECTION ================= */}
      <header className="relative border-b border-brass/10 overflow-hidden min-h-140 flex items-center">
        {/* Imagen de fondo optimizada */}
        <div className="absolute inset-0 opacity-100">
          <Image
            src="https://images.unsplash.com/photo-1775298373010-9c7d214e6374?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Fondo conmemorativo"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>

        {/* Gradiente y glow cálido sobre la imagen */}
        <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-ink via-ink/80 to-transparent" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 700px 400px at 20% 20%, rgba(169,129,76,0.18), transparent 70%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 md:px-10 pt-24 pb-28 w-full">
          <div className="max-w-3xl">
            <h1 className="font-display font-light text-5xl md:text-7xl leading-[1.08] mb-7 text-bone">
              Un espacio digital para honrar, con calma y dignidad.
            </h1>

            <p className="text-bone-400 text-lg md:text-xl leading-relaxed max-w-2xl mb-10 font-normal">
              Acompañamos a familias en momentos delicados. Diseñado para ofrecer
              serenidad, respeto y la tranquilidad de decidir sin prisas
              comerciales.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/catalogo"
                className="bg-brass hover:bg-brass-400 text-ink font-medium text-sm px-7 py-3.5 rounded transition-colors inline-flex items-center gap-2"
              >
                Explorar homenajes
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ================= PILARES / PRINCIPIOS ================= */}
            <section id="beneficios" className="border-b border-brass/10 py-12 md:py-14 bg-ink-800/40">
              <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">

                {/* Pilar 1 */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="p-3.5 sm:p-4 rounded-xl bg-ink-700 border border-white/10 text-brass shadow-sm shrink-0">
                    <Truck className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-bone">Entrega Inmediata</h4>
                    <p className="text-sm text-bone-400 mt-1 leading-relaxed">
                      Envíos directos y discretos a velatorios y salas en 24h.
                    </p>
                  </div>
                </div>

                {/* Pilar 2 */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="p-3.5 sm:p-4 rounded-xl bg-ink-700 border border-white/10 text-brass shadow-sm shrink-0">
                    <PenTool className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-bone">Grabado Incluido</h4>
                    <p className="text-sm text-bone-400 mt-1 leading-relaxed">
                      Personalización artesanal de placas y recordatorios conmemorativos.
                    </p>
                  </div>
                </div>

                {/* Pilar 3 */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="p-3.5 sm:p-4 rounded-xl bg-ink-700 border border-white/10 text-brass shadow-sm shrink-0">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-bone">Compra Transparente</h4>
                    <p className="text-sm text-bone-400 mt-1 leading-relaxed">
                      Precios claros, sin sobrecostos inesperados ni presiones comerciales.
                    </p>
                  </div>
                </div>

                {/* Pilar 4 */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="p-3.5 sm:p-4 rounded-xl bg-ink-700 border border-white/10 text-brass shadow-sm shrink-0">
                    <MessageCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-bone">Soporte Continuo</h4>
                    <p className="text-sm text-bone-400 mt-1 leading-relaxed">
                      Acompañamiento cercano y compasivo disponible por WhatsApp 24/7.
                    </p>
                  </div>
                </div>

              </div>
            </section>

      {/* ================= CATEGORÍAS CON IMÁGENES ================= */}
      <section className="py-12 border-b border-brass/10">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <p className="text-xs text-brass-400 font-medium tracking-wide mb-2">
                SELECCIÓN
              </p>
              <h2 className="font-display text-3xl md:text-4xl">
                Homenajes pensados para perdurar
              </h2>
            </div>
            <Link
              href="/catalogo"
              className="mt-4 md:mt-0 text-sm text-brass-300 hover:text-brass transition-colors inline-flex items-center gap-1.5"
            >
              Ir al catálogo completo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1: Urnas */}
            <div className="bg-ink-700/60 border border-white/10 rounded-md p-6 hover:border-brass/30 hover:shadow-glow transition-all flex flex-col">
              <div className="aspect-4/3 rounded border border-white/5 mb-6 overflow-hidden relative">
                <Image
                  src="https://images.unsplash.com/photo-1721373487766-0faaebd393f0?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Urnas elaboradas en metal y piedra"
                  fill
                  className="object-cover grayscale-30 hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <span className="text-xs text-bone-500">Urnas & Relicarios</span>
              <h3 className="font-display text-xl mt-1 mb-2">
                Urnas elaboradas en metal y piedra
              </h3>
              <p className="text-bone-400 text-sm leading-relaxed mb-6">
                Piezas talladas a mano diseñadas para preservar la memoria con
                sutileza y durabilidad perpetua.
              </p>
              <Link
                href="/catalogo"
                className="mt-auto text-xs text-brass-300 hover:underline font-medium inline-flex items-center gap-1"
              >
                Explorar urnas <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 2: Ataúdes */}
            <div className="bg-ink-700/60 border border-white/10 rounded-md p-6 hover:border-brass/30 hover:shadow-glow transition-all flex flex-col">
              <div className="aspect-4/3 rounded border border-white/5 mb-6 overflow-hidden relative">
                <Image
                  src="https://images.unsplash.com/photo-1718801666911-acd64e4c0cd4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGNvZmZpbnxlbnwwfHwwfHx8Mg%3D%3D"
                  alt="Ataúdes tradicionales en madera"
                  fill
                  className="object-cover grayscale-30 hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <span className="text-xs text-bone-500">
                Ataúdes tradicionales
              </span>
              <h3 className="font-display text-xl mt-1 mb-2">
                Maderas nobles y acabados satinados
              </h3>
              <p className="text-bone-400 text-sm leading-relaxed mb-6">
                Construcción artesanal sobria que prioriza líneas limpias y
                respeto en cada unión.
              </p>
              <Link
                href="/catalogo"
                className="mt-auto text-xs text-brass-300 hover:underline font-medium inline-flex items-center gap-1"
              >
                Explorar opciones <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 3: Botánica */}
            <div className="bg-ink-700/60 border border-white/10 rounded-md p-6 hover:border-brass/30 hover:shadow-glow transition-all flex flex-col">
              <div className="aspect-4/3 rounded border border-white/5 mb-6 overflow-hidden relative">
                <Image
                  src="https://images.unsplash.com/photo-1701893850250-13d3ee3709e1?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Composiciones florales y follaje"
                  fill
                  className="object-cover grayscale-30 hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <span className="text-xs text-bone-500">Tributos florales</span>
              <h3 className="font-display text-xl mt-1 mb-2">
                Composiciones de romero y follaje
              </h3>
              <p className="text-bone-400 text-sm leading-relaxed mb-6">
                Arreglos orgánicos inspirados en símbolos de recordación, sosiego
                y homenaje sobrio.
              </p>
              <Link
                href="/catalogo"
                className="mt-auto text-xs text-brass-300 hover:underline font-medium inline-flex items-center gap-1"
              >
                Explorar tributos <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= COMPROMISO / ORIENTACIÓN ================= */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs font-medium text-brass-400 tracking-wider">
            ORIENTACIÓN HUMANA
          </span>
          <h2 className="font-display text-3xl md:text-5xl mt-3 mb-6">
            Estamos aquí para responder tus dudas
          </h2>
          <p className="text-bone-400 text-base md:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            Si necesitas saber sobre plazos de entrega, personalización de
            grabados o compatibilidades, nuestro equipo te acompaña con trato
            directo y respetuoso.
          </p>
          <div className="inline-flex gap-4">
            <Link
              href="/contacto"
              className="bg-moss hover:bg-moss-400 text-bone font-medium text-sm px-8 py-3.5 rounded transition-colors inline-flex items-center gap-2"
            >
              <MessageSquareQuote className="w-4 h-4" />
              Hablar con un asesor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
