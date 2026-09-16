import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col bg-ink text-bone">
      {/* ================= HERO SECTION ================= */}
      <header className="relative border-b border-brass/10 overflow-hidden">
        {/* Glow cálido tenue */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 700px 400px at 20% 0%, rgba(169,129,76,0.14), transparent 60%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 md:px-10 pt-20 pb-28">
          <div className="max-w-3xl">
            <span className="text-xs font-medium text-brass-400 tracking-wider">
              ESPACIO DE MEMORIA Y HOMENAJE
            </span>
            <h1 className="font-display font-light text-5xl md:text-7xl leading-[1.08] mt-4 mb-7 text-bone">
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
                className="bg-brass hover:bg-brass-400 text-ink font-medium text-sm px-7 py-3.5 rounded transition-colors inline-block text-center"
              >
                Explorar homenajes
              </Link>
              <Link
                href="/contacto"
                className="bg-transparent border border-brass/40 hover:border-brass text-bone font-medium text-sm px-6 py-3.5 rounded transition-colors inline-block text-center"
              >
                Orientación y asistencia
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ================= PILARES / PRINCIPIOS ================= */}
      <section className="py-24 border-b border-brass/10">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-3">
              <span className="text-xs font-medium text-brass-300">01</span>
              <h3 className="font-display text-2xl text-bone">
                Dignidad silenciosa
              </h3>
              <p className="text-bone-400 text-sm leading-relaxed">
                Sin apremios ni avisos intrusivos. Cada opción está pensada para
                respetar la intimidad y el duelo de cada hogar.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-medium text-brass-300">02</span>
              <h3 className="font-display text-2xl text-bone">
                Acompañamiento pausado
              </h3>
              <p className="text-bone-400 text-sm leading-relaxed">
                Información transparente, clara y comprensible. Podrás tomarte el
                tiempo necesario para elegir lo que mejor rinda tributo.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-medium text-brass-300">03</span>
              <h3 className="font-display text-2xl text-bone">
                Cuidado en cada detalle
              </h3>
              <p className="text-bone-400 text-sm leading-relaxed">
                Materiales nobles seleccionados con dedicación: acabados de
                bronce, maderas tratadas y piezas con opción a grabado personal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PROPUESTAS / CATEGORÍAS (PREVIEW DE NAVEGACIÓN) ================= */}
      <section className="py-24 border-b border-brass/10">
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
              Ir al catálogo completo <span>→</span>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-ink-700/60 border border-white/10 rounded-md p-6 hover:border-brass/30 hover:shadow-glow transition-all">
              <div className="aspect-4/3 bg-ink-800 rounded border border-white/5 mb-6 flex items-center justify-center text-xs text-bone-500">
                Detalle en bronce
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
                className="text-xs text-brass-300 hover:underline font-medium"
              >
                Explorar urnas →
              </Link>
            </div>

            {/* Card 2 */}
            <div className="bg-ink-700/60 border border-white/10 rounded-md p-6 hover:border-brass/30 hover:shadow-glow transition-all">
              <div className="aspect-4/3 bg-ink-800 rounded border border-white/5 mb-6 flex items-center justify-center text-xs text-bone-500">
                Madera maciza
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
                className="text-xs text-brass-300 hover:underline font-medium"
              >
                Explorar opciones →
              </Link>
            </div>

            {/* Card 3 */}
            <div className="bg-ink-700/60 border border-white/10 rounded-md p-6 hover:border-brass/30 hover:shadow-glow transition-all">
              <div className="aspect-4/3 bg-ink-800 rounded border border-white/5 mb-6 flex items-center justify-center text-xs text-bone-500">
                Homenajes botánicos
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
                className="text-xs text-brass-300 hover:underline font-medium"
              >
                Explorar tributos →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= COMPROMISO / DISCRECIÓN ================= */}
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
              className="bg-moss hover:bg-moss-400 text-bone font-medium text-sm px-8 py-3.5 rounded transition-colors"
            >
              Hablar con un asesor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
