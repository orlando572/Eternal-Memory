const PRODUCTOS = [
  {
    id: "urna-serenidad-bronce",
    categoria: "Urnas",
    nombre: "Urna Serenidad en bronce",
    precio: "S/ 480",
    badge: "En stock",
    badgeTipo: "moss",
  },
  {
    id: "ataud-roble-clasico",
    categoria: "Ataúdes",
    nombre: "Ataúd Roble Clásico",
    precio: "S/ 2,100",
    badge: "Personalizable",
    badgeTipo: "neutral",
  },
  {
    id: "relicario-petalo-bronce",
    categoria: "Relicarios",
    nombre: "Relicario Pétalo Bronce",
    precio: "S/ 190",
    badge: "Últimas unidades",
    badgeTipo: "ember",
  },
  {
    id: "corona-botanica-romero",
    categoria: "Arreglos florales",
    nombre: "Corona Botánica Silvestre",
    precio: "S/ 260",
    badge: "Envío en 24h",
    badgeTipo: "brass",
  },
  {
    id: "urna-marmol-silencioso",
    categoria: "Urnas",
    nombre: "Urna Mármol Silencioso",
    precio: "S/ 620",
    badge: "En stock",
    badgeTipo: "moss",
  },
  {
    id: "ataud-cedro-imperial",
    categoria: "Ataúdes",
    nombre: "Ataúd Cedro Imperial",
    precio: "S/ 2,850",
    badge: "Personalizable",
    badgeTipo: "neutral",
  },
  {
    id: "centro-orquideas-lirios",
    categoria: "Arreglos florales",
    nombre: "Centro de Orquídeas y Lirios",
    precio: "S/ 310",
    badge: "Envío en 24h",
    badgeTipo: "brass",
  },
  {
    id: "urna-organica-tierra",
    categoria: "Urnas",
    nombre: "Urna Orgánica Tierra Viva",
    precio: "S/ 390",
    badge: "En stock",
    badgeTipo: "moss",
  },
];

export default function CatalogoView() {
  return (
    <>
      {/* CABECERA */}
      <header className="border-b border-brass/10 py-12 md:py-16 bg-ink-800/30">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <span className="text-xs font-medium text-brass-400 tracking-wider">SELECCIÓN</span>
          <h1 className="font-display font-light text-4xl md:text-5xl mt-2 mb-4">Catálogo de productos</h1>
          <p className="text-bone-400 text-sm md:text-base max-w-2xl leading-relaxed">
            Explora los homenajes disponibles organizados con calma y sobriedad.
          </p>
        </div>
      </header>

      {/* REJILLA */}
      <main className="max-w-7xl mx-auto px-6 md:px-10 py-10 flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/10 mb-10">
          <div className="flex flex-wrap items-center gap-2">
            <button className="text-xs font-medium bg-brass/15 text-brass-300 border border-brass/30 px-3.5 py-1.5 rounded transition-colors">
              Todos
            </button>
            <button className="text-xs font-medium text-bone-400 hover:text-bone hover:bg-white/5 border border-transparent px-3.5 py-1.5 rounded transition-colors">
              Urnas
            </button>
            <button className="text-xs font-medium text-bone-400 hover:text-bone hover:bg-white/5 border border-transparent px-3.5 py-1.5 rounded transition-colors">
              Ataúdes
            </button>
            <button className="text-xs font-medium text-bone-400 hover:text-bone hover:bg-white/5 border border-transparent px-3.5 py-1.5 rounded transition-colors">
              Relicarios
            </button>
            <button className="text-xs font-medium text-bone-400 hover:text-bone hover:bg-white/5 border border-transparent px-3.5 py-1.5 rounded transition-colors">
              Arreglos florales
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-bone-500">
            <span>Ordenar: Relevancia</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {PRODUCTOS.map((item) => (
            <div key={item.id} className="group">
              <div className="aspect-4/5 bg-ink-700 rounded-md border border-white/10 group-hover:border-brass/30 group-hover:shadow-glow transition-all flex flex-col items-center justify-center relative p-3">
                <span className="text-bone-500 text-xs">imagen del producto</span>

                <div className="absolute top-3 left-3">
                  {item.badgeTipo === "moss" && (
                    <span className="text-[11px] font-medium bg-moss/15 text-moss-400 border border-moss/30 px-2.5 py-1 rounded">
                      {item.badge}
                    </span>
                  )}
                  {item.badgeTipo === "ember" && (
                    <span className="text-[11px] font-medium bg-ember/15 text-ember-400 border border-ember/30 px-2.5 py-1 rounded">
                      {item.badge}
                    </span>
                  )}
                  {item.badgeTipo === "brass" && (
                    <span className="text-[11px] font-medium bg-brass/15 text-brass-300 border border-brass/30 px-2.5 py-1 rounded">
                      {item.badge}
                    </span>
                  )}
                  {item.badgeTipo === "neutral" && (
                    <span className="text-[11px] font-medium bg-white/5 text-bone-400 border border-white/10 px-2.5 py-1 rounded">
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <p className="text-xs text-bone-500 mb-1">{item.categoria}</p>
                <p className="font-medium text-sm text-bone">{item.nombre}</p>
                <p className="text-brass-300 text-sm mt-1">{item.precio}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
