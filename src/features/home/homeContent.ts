import type { CatalogCategory } from "@/features/catalogo/types/catalog";
import { footerContact } from "@/features/footer/footerContent";

type HomeContent = {
  kicker: string;
  title: string;
  subtitle: string;
  collection: string;
  heading: string;
  description: string;
  catalogLabel: string;
};

const contentByCategory: Record<string, HomeContent> = {
  urnas: {
    kicker: "Un último homenaje, siempre presente",
    title: "Elegir con calma",
    subtitle: "Urnas para honrar a quienes amamos.",
    collection: "Nuestras urnas",
    heading: "Diseños para cada historia",
    description: "Materiales y formas para conservar su recuerdo. Explora cada urna y conoce sus opciones con calma.",
    catalogLabel: "Ver todas las urnas",
  },
  ataudes: {
    kicker: "Una despedida con respeto",
    title: "Honrar su historia",
    subtitle: "Ataúdes para acompañar un último homenaje.",
    collection: "Nuestros ataúdes",
    heading: "Detalles que acompañan",
    description: "Conoce materiales, acabados y opciones para elegir una despedida que exprese tu cariño.",
    catalogLabel: "Ver todos los ataúdes",
  },
  "arreglos-florales": {
    kicker: "El cariño también florece",
    title: "Expresar el cariño",
    subtitle: "Arreglos florales para acompañar y recordar.",
    collection: "Nuestros arreglos florales",
    heading: "Flores para un homenaje",
    description: "Formas y colores para expresar lo que sientes. Encuentra un arreglo para acompañar su recuerdo.",
    catalogLabel: "Ver todos los arreglos",
  },
  relicarios: {
    kicker: "Un vínculo que permanece",
    title: "Sentir su cercanía",
    subtitle: "Relicarios para llevar contigo un recuerdo especial.",
    collection: "Nuestros relicarios",
    heading: "Recuerdos que acompañan",
    description: "Pequeños detalles con un significado personal. Explora diseños para mantener cerca su memoria.",
    catalogLabel: "Ver todos los relicarios",
  },
};

export function getHomeContent(category?: CatalogCategory): HomeContent {
  if (!category) return contentByCategory.urnas;
  return contentByCategory[category.slug] ?? {
    kicker: "Un homenaje a su memoria",
    title: "Recordar con cariño",
    subtitle: `${category.name} para honrar a quienes amamos.`,
    collection: category.name,
    heading: "Una elección personal",
    description: "Explora los productos de esta categoría y conoce sus detalles y opciones a tu propio ritmo.",
    catalogLabel: "Ver toda la categoría",
  };
}

// Textos de las secciones bajo la rejilla de productos. Describen solo lo que la
// tienda hace hoy: no anuncian plazos de entrega, stock garantizado, atención
// fuera del horario publicado ni pago en línea.

// «Lunes a sábado · 9:00 a 19:00» → «lunes a sábado, de 9:00 a 19:00».
const scheduleText = footerContact.schedule.replace(" · ", ", de ");
const attentionHours = scheduleText.charAt(0).toLowerCase() + scheduleText.slice(1);

export type HomeStepIcon = "explore" | "choose" | "review" | "confirm";
export type HomeSupportIcon = "prices" | "engraving" | "delivery" | "contact";

export const homeHowItWorks = {
  kicker: "Cómo funciona",
  title: "Un pedido, paso a paso",
  intro: "Puedes detenerte en cualquier momento. Antes de confirmar verás siempre el resumen completo.",
  steps: [
    {
      icon: "explore" as HomeStepIcon,
      title: "Explora con calma",
      text: "Recorre el catálogo por categoría o busca por nombre. Cada ficha muestra la descripción, las opciones y los precios en soles.",
    },
    {
      icon: "choose" as HomeStepIcon,
      title: "Elige opción y cantidad",
      text: "Selecciona la variante y la cantidad, y añádelas al carrito. Tu selección se guarda en este navegador.",
    },
    {
      icon: "review" as HomeStepIcon,
      title: "Revisa entrega y grabado",
      text: "Inicia sesión e indica la dirección de entrega. Si la urna lo admite, puedes añadir un grabado opcional y ver el envío y el total.",
    },
    {
      icon: "confirm" as HomeStepIcon,
      title: "Confirma tu pedido",
      text: "El pedido queda pendiente de pago y las unidades se reservan durante 30 minutos. El pago en línea aún no está habilitado.",
    },
  ],
};

export const homeSupport = {
  kicker: "Te acompañamos",
  title: "Información clara para decidir",
  intro: "Queremos que conozcas cada detalle antes de confirmar, sin prisas.",
  points: [
    {
      icon: "prices" as HomeSupportIcon,
      title: "Precios en soles",
      text: "Cada ficha muestra el precio de sus opciones. Antes de confirmar revisamos de nuevo precios y existencias de tu selección.",
    },
    {
      icon: "engraving" as HomeSupportIcon,
      title: "Grabado opcional",
      text: "En las urnas que lo admiten puedes grabar un nombre. Verás el recargo y el límite de caracteres antes de confirmar.",
    },
    {
      icon: "delivery" as HomeSupportIcon,
      title: "Envío según destino",
      text: "La tarifa depende de si la entrega es en la provincia de Arequipa o en el resto del Perú, en las ubicaciones con cobertura.",
    },
    {
      icon: "contact" as HomeSupportIcon,
      title: "Orientación en nuestro horario",
      text: `Escríbenos por correo o WhatsApp. Nuestro horario de atención es de ${attentionHours}.`,
    },
  ],
};

export const homeFeaturedCategories = {
  kicker: "Categorías",
  title: "Explora por categoría",
  intro: "Entra directamente a la parte del catálogo que necesitas.",
  cardAction: "Ver productos",
  allLabel: "Ver todo el catálogo",
  emptyText: "Las categorías no están disponibles en este momento. Puedes explorar el catálogo completo.",
};

export const homeFaq = {
  kicker: "Preguntas frecuentes",
  title: "Lo que suelen preguntarnos",
  intro: "Si tu duda no aparece aquí, escríbenos y la revisamos contigo.",
  items: [
    {
      id: "envio",
      question: "¿Cómo se calcula el envío?",
      answer: "Depende del distrito de entrega: hay una tarifa para la provincia de Arequipa y otra para el resto del Perú. Al revisar tu pedido verás el costo del envío y el total antes de confirmar. Si una ubicación está fuera de cobertura, te lo indicaremos en ese momento.",
    },
    {
      id: "reserva",
      question: "¿Qué significa que el pedido quede pendiente de pago?",
      answer: "Al confirmar, registramos tu pedido como pendiente de pago y reservamos las unidades durante 30 minutos. Añadir productos al carrito, por sí solo, no reserva unidades, y confirmar el pedido no equivale a un pago.",
    },
    {
      id: "pago",
      question: "¿Qué medios de pago aceptan?",
      answer: "Por ahora el pago en línea no está habilitado. Si tienes un pedido pendiente o una duda sobre el pago, comunícate con nosotros por correo o WhatsApp.",
    },
    {
      id: "grabado",
      question: "¿Cómo funciona el grabado?",
      answer: "El grabado del nombre es opcional y solo está disponible en las urnas que lo admiten. Lo eliges al revisar tu pedido, donde verás el recargo por urna y el número máximo de caracteres. Si llevas varias urnas, puedes usar el mismo nombre o uno distinto en cada una.",
    },
    {
      id: "cuenta",
      question: "¿Necesito una cuenta?",
      answer: "Puedes explorar el catálogo y preparar tu carrito sin cuenta. Para revisar la entrega y confirmar un pedido necesitas iniciar sesión o crear una cuenta.",
    },
    {
      id: "carrito",
      question: "¿Dónde se guarda mi selección?",
      answer: "El carrito se guarda en este navegador y no se sincroniza con tu cuenta ni con otros dispositivos. Antes de confirmar revisamos de nuevo los precios y las existencias.",
    },
    {
      id: "imagenes",
      question: "¿Las fotografías muestran el producto exacto?",
      answer: "Algunas imágenes del catálogo son referenciales y pueden no coincidir con el producto. Guíate por la descripción, las opciones y el precio de cada ficha, y escríbenos si tienes dudas.",
    },
    {
      id: "contacto",
      question: "¿Cómo puedo comunicarme con ustedes?",
      answer: `Escríbenos por WhatsApp al ${footerContact.phone} o desde la página de contacto. Nuestro horario de atención es de ${attentionHours}.`,
    },
  ],
};

export const homeContact = {
  kicker: "Conversemos",
  title: "¿Prefieres conversar antes de elegir?",
  text: "Te ayudamos a resolver dudas sobre productos, opciones de grabado o la entrega, a tu ritmo.",
  whatsappLabel: "Escribir por WhatsApp",
  contactPageLabel: "Ir a contacto",
  scheduleLabel: "Horario de atención",
  contact: footerContact,
};

// Carrusel informativo bajo la rejilla de productos (TSK-34). Para cambiar los
// mensajes basta con editar `slides`; el componente no tiene textos propios.
// Cada imagen debe existir en `public/`; si representa un producto, márcala como
// referencial. `position` ajusta el recorte (valor de CSS object-position).
export type HomeBannerSlide = {
  id: string;
  kicker: string;
  title: string;
  text: string;
  action: { label: string; href: string };
  image: { src: string; width: number; height: number; alt: string; isReference: boolean; position?: string };
};

const bannerSlides: HomeBannerSlide[] = [
  {
    id: "grabado",
    kicker: "Grabado opcional",
    title: "Un homenaje con su nombre",
    text: "En las urnas que lo admiten puedes grabar el nombre de la persona. Verás el recargo y el límite de caracteres antes de confirmar tu pedido.",
    action: { label: "Ver urnas", href: "/catalogo?categoria=urnas" },
    image: { src: "/assets/plates/product-marble-photo.png", width: 1622, height: 969, alt: "", isReference: true },
  },
  {
    id: "envio",
    kicker: "Envío según destino",
    title: "Entregas en Arequipa y el resto del Perú",
    text: "La tarifa depende de si la entrega es en la provincia de Arequipa o en el resto del Perú. Verás el costo del envío antes de confirmar.",
    action: { label: "Ver preguntas frecuentes", href: "/#home-faq-title" },
    image: { src: "/assets/catalogo/backgrounds/arreglos-florales.webp", width: 3456, height: 724, alt: "", isReference: false, position: "right center" },
  },
  {
    id: "orientacion",
    kicker: "Orientación",
    title: "Te orientamos en nuestro horario",
    text: `Escríbenos por correo o WhatsApp si tienes dudas sobre productos, grabado o entrega. Nuestro horario de atención es de ${attentionHours}.`,
    action: { label: "Ir a contacto", href: "/#home-contact-title" },
    image: { src: "/assets/plates/patio-view.png", width: 1254, height: 1254, alt: "", isReference: false },
  },
];

export const homeBanner = {
  label: "Mensajes de Eternal Memory",
  // Avance automático lento, en milisegundos.
  autoplayDelayMs: 8000,
  referenceNote: "Imagen referencial",
  previousLabel: "Mensaje anterior",
  nextLabel: "Mensaje siguiente",
  slides: bannerSlides,
};
