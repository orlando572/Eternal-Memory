export interface Product {
  id: string;
  categoria: string;
  nombre: string;
  precio: string;
  badge: string;
  badgeTipo: 'moss' | 'neutral' | 'ember' | 'brass';
  descripcion?: string;
  imagenes?: string[];
  opciones?: string[];
}

export const PRODUCTOS: Product[] = [
  {
    id: "urna-serenidad-bronce",
    categoria: "Urnas",
    nombre: "Urna Serenidad en bronce",
    precio: "S/ 480",
    badge: "En stock",
    badgeTipo: "moss",
    descripcion: "Urna fabricada en bronce pulido con acabado mate y cierre hermético de alta seguridad.",
    imagenes: ["/images/urna-bronce-1.jpg", "/images/urna-bronce-2.jpg"],
    opciones: ["Bronce Pulido", "Bronce Envejecido"]
  },
  {
    id: "ataud-roble-clasico",
    categoria: "Ataúdes",
    nombre: "Ataúd Roble Clásico",
    precio: "S/ 2,100",
    badge: "Personalizable",
    badgeTipo: "neutral",
    descripcion: "Construido en madera de roble macizo con interiores tapizados en satén fino.",
    imagenes: ["/images/ataud-roble-1.jpg"],
    opciones: ["Acabado Caoba", "Acabado Natural"]
  },
  {
    id: "relicario-petalo-bronce",
    categoria: "Relicarios",
    nombre: "Relicario Pétalo Bronce",
    precio: "S/ 190",
    badge: "Últimas unidades",
    badgeTipo: "ember",
    descripcion: "Pieza conmemorativa de mano esculpida en forma de pétalo sobrio.",
    imagenes: ["/images/relicario-1.jpg"],
    opciones: ["Única versión"]
  },
  {
    id: "corona-botanica-romero",
    categoria: "Arreglos florales",
    nombre: "Corona Botánica Silvestre",
    precio: "S/ 260",
    badge: "Envío en 24h",
    badgeTipo: "brass",
    descripcion: "Arreglo con especies botánicas frescas y follaje de romero y eucalipto.",
    imagenes: ["/images/corona-1.jpg"],
    opciones: ["Tamaño Estándar", "Tamaño Grande"]
  },
  {
    id: "urna-marmol-silencioso",
    categoria: "Urnas",
    nombre: "Urna Mármol Silencioso",
    precio: "S/ 620",
    badge: "En stock",
    badgeTipo: "moss",
    descripcion: "Mármol tallado a mano con vetas naturales únicas e interior pulido.",
    imagenes: ["/images/urna-marmol-1.jpg"],
    opciones: ["Mármol Blanco", "Mármol Negro"]
  },
  {
    id: "ataud-cedro-imperial",
    categoria: "Ataúdes",
    nombre: "Ataúd Cedro Imperial",
    precio: "S/ 2,850",
    badge: "Personalizable",
    badgeTipo: "neutral",
    descripcion: "Madera de cedro seleccionada con herrajes artesanales de bronce.",
    imagenes: ["/images/ataud-cedro-1.jpg"],
    opciones: ["Barniz Brillante", "Barniz Mate"]
  },
  {
    id: "centro-orquideas-lirios",
    categoria: "Arreglos florales",
    nombre: "Centro de Orquídeas y Lirios",
    precio: "S/ 310",
    badge: "Envío en 24h",
    badgeTipo: "brass",
    descripcion: "Centro floral con orquídeas blancas y lirios seleccionados.",
    imagenes: ["/images/centro-1.jpg"],
    opciones: ["Blanco Puro", "Marfil"]
  },
  {
    id: "urna-organica-tierra",
    categoria: "Urnas",
    nombre: "Urna Orgánica Tierra Viva",
    precio: "S/ 390",
    badge: "En stock",
    badgeTipo: "moss",
    descripcion: "Biodegradable, elaborada con componentes minerales y orgánicos.",
    imagenes: ["/images/urna-organica-1.jpg"],
    opciones: ["Tierra Natural"]
  }
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTOS.find((p) => p.id === id);
}