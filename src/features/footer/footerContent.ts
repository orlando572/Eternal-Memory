// Datos provisionales solicitados para la presentación final del footer.
// Sustituir los contactos antes de publicar los canales oficiales del negocio.
export const footerContact = {
  email: "contacto@eternalmemory.pe",
  phone: "+51 900 000 000",
  whatsappUrl: "https://wa.me/51900000000",
  location: "Arequipa, Perú",
  schedule: "Lunes a sábado · 9:00 a 19:00",
};

export const footerLegal = [
  {
    id: "privacy",
    label: "Privacidad",
    title: "Política de privacidad",
    intro: "En Eternal Memory tratamos tus datos con respeto y los utilizamos para acompañarte en la gestión de tu cuenta y tus consultas.",
    sections: [
      { title: "Datos de tu cuenta", text: "Al crear una cuenta o completar tu perfil, proporcionas información como tu nombre, correo y otros datos de contacto. Utilizamos estos datos para identificar tu cuenta y mantener actualizada la información que nos compartes." },
      { title: "Consultas y pedidos", text: "Los datos de contacto y entrega que proporcionas al preparar un pedido permiten gestionar tu solicitud. Si nos escribes por correo o WhatsApp, utilizaremos la información de la conversación para responderte." },
      { title: "Tu selección en este navegador", text: "El carrito se guarda en el almacenamiento local de tu navegador. No se sincroniza automáticamente con otros dispositivos. Puedes vaciarlo desde el carrito o borrar los datos del sitio en la configuración de tu navegador." },
      { title: "Servicios externos", text: "Los enlaces a WhatsApp y a tu aplicación de correo abren servicios externos, sujetos a sus propias condiciones de privacidad. Decide qué información deseas compartir al utilizarlos." },
      { title: "Contacto sobre tus datos", text: `Puedes actualizar la información disponible en tu perfil o escribir a ${footerContact.email} para consultar sobre el tratamiento, la corrección o la eliminación de tus datos.` },
    ],
  },
  {
    id: "terms",
    label: "Términos y condiciones",
    title: "Términos y condiciones",
    intro: "Estas condiciones describen el uso del catálogo, la cuenta y la preparación de pedidos en Eternal Memory.",
    sections: [
      { title: "Uso del catálogo", text: "Puedes explorar los productos sin crear una cuenta. Consulta la descripción, las variantes y los precios de cada ficha para elegir la opción que se ajuste a tus necesidades. Si tienes dudas sobre un material, acabado o personalización, comunícate con nuestro equipo." },
      { title: "Precios y disponibilidad", text: "Los precios se expresan en soles peruanos. El precio y la disponibilidad se revisan al preparar el pedido y pueden cambiar mientras exploras el catálogo. La selección en el carrito, por sí sola, no reserva unidades." },
      { title: "Preparación del pedido", text: "Revisa los productos, las cantidades, los datos de entrega y los textos de personalización antes de confirmar. El resumen muestra los importes aplicables al pedido. Registrar un pedido pendiente no equivale a realizar un pago; el pago en línea no está habilitado." },
      { title: "Tu cuenta", text: "Mantén tus datos de contacto actualizados y protege tus credenciales de acceso. Si detectas un problema con tu cuenta o con la información de un pedido, comunícate con nosotros para revisarlo." },
      { title: "Atención y consultas", text: `Para consultar sobre productos, entrega o una solicitud, escríbenos a ${footerContact.email} o utiliza nuestro canal de WhatsApp. Nuestro horario de atención es de lunes a sábado, de 9:00 a 19:00.` },
    ],
  },
];
