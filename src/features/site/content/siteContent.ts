import { footerContact } from "@/features/footer/footerContent";

// Textos de las páginas comerciales (TSK-20). No prometen plazos de entrega, atención 24/7 ni
// existencias garantizadas. Los textos legales los revisa el equipo antes de cada publicación.

export type ContentSection = { title: string; text: string };
export type ContentPage = { path: string; title: string; heading: string; intro: string; description: string; sections: ContentSection[] };

export const aboutPage: ContentPage = {
  path: "/nosotros",
  title: "Nosotros",
  heading: "Un espacio para elegir con calma",
  description: "Conoce Eternal Memory: un catálogo de productos funerarios para elegir con claridad y sin presión comercial.",
  intro: "Eternal Memory reúne productos funerarios en un solo lugar para que las familias puedan conocer sus opciones a su ritmo y decidir con serenidad.",
  sections: [
    { title: "Lo que hacemos", text: "Mostramos un catálogo de urnas, ataúdes, relicarios y arreglos florales, con sus opciones y sus precios en soles, para que puedas comparar con claridad antes de decidir." },
    { title: "Cómo trabajamos", text: "Creemos que elegir en un momento delicado merece claridad y respeto. Indicamos las opciones de cada producto, avisamos cuando una fotografía es referencial y revisamos los precios y las existencias al preparar tu pedido." },
    { title: "Dónde estamos", text: `Atendemos desde ${footerContact.location}. Resolvemos tus consultas por WhatsApp y por teléfono. Horario de atención: ${footerContact.schedule}.` },
  ],
};

export const privacyPage: ContentPage = {
  path: "/privacidad",
  title: "Política de privacidad",
  heading: "Política de privacidad",
  description: "Cómo trata Eternal Memory los datos de tu cuenta, tus pedidos y tus consultas.",
  intro: "En Eternal Memory tratamos tus datos con respeto y los utilizamos para acompañarte en la gestión de tu cuenta, tus pedidos y tus consultas.",
  sections: [
    { title: "Datos de tu cuenta", text: "Al crear una cuenta o completar tu perfil, proporcionas información como tu nombre, correo y otros datos de contacto. Utilizamos estos datos para identificar tu cuenta y mantener actualizada la información que nos compartes." },
    { title: "Consultas y pedidos", text: "Los datos de contacto y entrega que proporcionas al preparar un pedido permiten gestionarlo. Si nos escribes por WhatsApp o nos llamas, utilizaremos la información de la conversación para responderte." },
    { title: "Formulario de contacto", text: "El formulario de contacto no guarda lo que escribes. Al continuar se abre WhatsApp con tu mensaje ya escrito, y solo nos llega si pulsas «Enviar» en WhatsApp." },
    { title: "Tu selección en este navegador", text: "El carrito se guarda en el almacenamiento local de tu navegador. No se sincroniza automáticamente con otros dispositivos. Puedes vaciarlo desde el carrito o borrar los datos del sitio en la configuración de tu navegador." },
    { title: "Pagos", text: "El pago de un pedido se completa en la página de pago de nuestro proveedor, Stripe. Eternal Memory no recibe ni guarda los datos de tu tarjeta." },
    { title: "Servicios externos", text: "WhatsApp y Stripe son servicios externos, sujetos a sus propias condiciones y políticas de privacidad. Decide qué información deseas compartir al utilizarlos." },
    { title: "Contacto sobre tus datos", text: `Puedes actualizar la información de tu perfil o escribirnos por WhatsApp al ${footerContact.phone}, o desde la página de contacto, para consultar sobre el tratamiento, la corrección o la eliminación de tus datos.` },
  ],
};

export const termsPage: ContentPage = {
  path: "/terminos",
  title: "Términos y condiciones",
  heading: "Términos y condiciones",
  description: "Condiciones de uso del catálogo, la cuenta y los pedidos de Eternal Memory.",
  intro: "Estas condiciones describen el uso del catálogo, la cuenta y la preparación de pedidos en Eternal Memory.",
  sections: [
    { title: "Uso del catálogo", text: "Puedes explorar los productos sin crear una cuenta. Consulta la descripción, las variantes y los precios de cada ficha para elegir la opción que se ajuste a tus necesidades. Si tienes dudas sobre un material, acabado o personalización, comunícate con nuestro equipo." },
    { title: "Precios y disponibilidad", text: "Los precios se expresan en soles peruanos. El precio y la disponibilidad se revisan al preparar el pedido y pueden cambiar mientras exploras el catálogo. La selección en el carrito, por sí sola, no reserva unidades." },
    { title: "Pedido y pago", text: "Revisa los productos, las cantidades, los datos de entrega y los textos de personalización antes de confirmar. Al confirmar se registra un pedido pendiente de pago y se reservan las unidades durante 30 minutos. El pedido queda pagado solo cuando se confirma el pago en la página de pago de Stripe. Confirmar un pedido no garantiza una fecha de entrega." },
    { title: "Envíos", text: "El costo de envío depende de la zona de entrega y se muestra en el resumen antes de confirmar el pedido. Consulta las zonas, las tarifas y las áreas sin cobertura en la página de envíos." },
    { title: "Tu cuenta", text: "Mantén tus datos de contacto actualizados y protege tus credenciales de acceso. Si detectas un problema con tu cuenta o con la información de un pedido, comunícate con nosotros para revisarlo." },
    { title: "Atención y consultas", text: `Para consultar sobre productos, entrega o una solicitud, escríbenos por WhatsApp al ${footerContact.phone} o desde la página de contacto. Horario de atención: ${footerContact.schedule}.` },
  ],
};
