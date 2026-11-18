# Diagrama general de clases de Eternal Memory

Vista conceptual unificada basada en develop, commit 9c054bf. Los nombres en español agrupan los tipos del catálogo, los formularios de administración y el checkout; no representan clases instanciables literales.

```mermaid
classDiagram
  direction TB
  class Usuario {
    +string id
    +string email
  }
  class Perfil {
    +string nombreCompleto
    +string telefono
    +string dni
  }
  class Acceso {
    +string rol
  }
  class Categoria {
    +string id
    +string nombre
  }
  class Producto {
    +string id
    +string nombre
    +string descripcion
    +string estado
  }
  class Variante {
    +string id
    +string nombre
    +decimal precio
    +int stockDisponible
  }
  class Imagen {
    +string ubicacion
    +boolean esReferencial
  }
  class Carrito {
    +int totalUnidades
    +agregarProducto()
    +actualizarCantidad()
    +eliminarProducto()
  }
  class LineaCarrito {
    +string clave
    +int cantidad
    +decimal precioUnitario
  }
  class Cotizacion {
    +string id
    +datetime vencimiento
    +decimal subtotal
    +decimal costoEntrega
    +decimal total
  }
  class Pedido {
    +string id
    +string estado
    +string estadoPago
    +datetime vencimientoReserva
    +decimal total
  }
  class DetalleCompra {
    +int cantidad
    +string nombreProducto
    +string nombreVariante
    +decimal precioUnitario
    +decimal totalLinea
  }
  class Personalizacion {
    +string modo
    +string texto
  }
  class ConfiguracionGrabado {
    +decimal recargoUnitario
    +int maximoCaracteres
    +boolean activa
  }

  Usuario "1" -- "0..1" Perfil : tiene
  Acceso --> Usuario : identifica
  Usuario "1" --> "0..*" Cotizacion : solicita
  Usuario "1" --> "0..*" Pedido : realiza
  Producto "0..*" --> "1" Categoria : pertenece
  Producto "1" *-- "0..*" Variante : variantes
  Producto "1" *-- "0..*" Imagen : imagenes
  Carrito "1" *-- "0..*" LineaCarrito : contiene
  LineaCarrito --> Variante : selecciona
  Carrito ..> Cotizacion : origen de la seleccion
  Cotizacion "1" *-- "1..*" DetalleCompra : lineas cotizadas
  Pedido "1" *-- "1..*" DetalleCompra : lineas confirmadas
  Cotizacion ..> Pedido : base de confirmacion
  DetalleCompra --> Variante : referencia
  DetalleCompra "1" *-- "0..1" Personalizacion : grabado solicitado
  ConfiguracionGrabado --> Categoria : habilita grabado
  ConfiguracionGrabado ..> Personalizacion : define limites y recargo
```

- El rol de acceso admite usuario o administrador. La administración gestiona productos, variantes, imágenes y configuración del grabado.
- El carrito pertenece al navegador y se conserva en localStorage; no se asocia a la cuenta.
- Cotización y pedido contienen copias independientes de los detalles y la ubicación de entrega. DetalleCompra resume CheckoutQuoteLine; no es una misma instancia compartida entre ambos.
- Los precios, existencias y estados agrupan modelos distintos de lectura y edición. El carrito también admite selecciones heredadas que todavía deben resolver su variante.
- Las relaciones punteadas expresan dependencias del proceso. El diagrama no presupone una relación persistida entre carrito, cotización y pedido ni un pago completado.
