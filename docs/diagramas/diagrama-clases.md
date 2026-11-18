# Diagrama de clases de Eternal Memory

Basado en `develop`, commit `9c054bf`.

El proyecto usa tipos, interfaces, funciones y componentes React. Se utiliza notación de clases UML para representar estas estructuras; los servicios representan módulos de funciones, no clases instanciables. Se muestran los atributos principales, no todos los campos auxiliares ni componentes de interfaz. `?` indica un campo opcional.

## Catálogo, carrito y pedidos

```mermaid
classDiagram
  class CatalogCategory {
    +string id
    +string slug
    +string name
  }
  class CatalogProduct {
    +string id
    +string slug
    +string name
    +string description
    +boolean isAvailable
  }
  class CatalogVariant {
    +string id
    +string name
    +number pricePen
    +number availableQuantity
  }
  class CatalogImage {
    +string id
    +string src
    +string alt
    +boolean isReference
  }
  class Product {
    <<interface>>
    +string id
    +string categoria
    +string nombre
    +string precio
  }
  class CartItem {
    <<interface>>
    +string productId?
    +string variantId?
    +number unitPricePen?
    +string selectedOption
    +number quantity
  }
  class CartLine {
    <<interface>>
    +string key
    +string[] consumedOrderIds?
  }
  class CartContextType {
    <<interface>>
    +boolean isOpen
    +number totalItems
    +addToCart(item)
    +removeFromCart(key)
    +updateQuantity(key, quantity)
    +consumeOrder(lines, orderId)
    +clearCart()
  }
  class CartValidation {
    +number totalPen
  }
  class ValidatedCartLine {
    +string key
    +string status
    +number unitPricePen?
    +number availableQuantity?
    +number subtotalPen?
  }
  class CheckoutInput {
    +string contactName
    +string contactEmail
    +string contactPhone
    +string addressLine
    +string ubigeo
  }
  class CheckoutLine {
    +string key
    +string productId
    +string variantId
    +number quantity
  }
  class CheckoutCustomization {
    +string mode
    +string text
  }
  class CheckoutQuoteLine {
    +string productName
    +string variantName
    +number baseUnitPricePen
    +number customizationUnitPen
    +number unitPricePen
    +number lineTotalPen
  }
  class CheckoutSummary {
    +string deliveryZone
    +number baseSubtotalPen
    +number customizationPen
    +number subtotalPen
    +number deliveryPen
    +number totalPen
  }
  class CheckoutQuote {
    +string quoteId
    +string expiresAt
  }
  class CheckoutOrder {
    +string id
    +string status
    +string paymentStatus
    +string reservationExpiresAt
    +number subtotalPen
    +number deliveryPen
    +number totalPen
  }

  CatalogProduct "0..*" --> "1" CatalogCategory : category
  CatalogProduct "1" *-- "0..*" CatalogVariant : variants
  CatalogProduct "1" *-- "0..*" CatalogImage : images
  Product <|-- CartItem
  CartItem <|-- CartLine
  CartContextType "1" o-- "0..*" CartLine : cart
  CartContextType "1" --> "0..1" CartValidation : validation
  CartValidation "1" *-- "0..*" ValidatedCartLine : lines
  CartItem ..> CatalogVariant : variantId opcional
  CheckoutInput "1" *-- "0..*" CheckoutLine : lines
  CheckoutLine --> CatalogProduct : productId
  CheckoutLine --> CatalogVariant : variantId
  CheckoutLine "1" *-- "0..1" CheckoutCustomization : customization
  CheckoutLine <|-- CheckoutQuoteLine
  CheckoutSummary "1" *-- "0..*" CheckoutQuoteLine : lines
  CheckoutQuote "1" *-- "1" CheckoutSummary : summary
  CheckoutOrder "1" *-- "0..*" CheckoutQuoteLine : lines
```

Las multiplicidades de los arreglos expresan sus tipos TypeScript; las validaciones de ejecución pueden exigir líneas o variantes. `CheckoutQuoteLine` amplía `CheckoutLine` mediante una intersección de tipos. `Product` es el modelo de presentación heredado que todavía utiliza el carrito; `CatalogProduct` es el modelo del catálogo actual. No existe herencia entre ambos.

## Cuenta y servicios

```mermaid
classDiagram
  class User {
    <<external>>
    +string id
  }
  class CurrentAccess {
    +AccountRole role
  }
  class UserProfile {
    +string id
    +string full_name
    +string phone
    +string dni
    +string birth_date
    +string gender
  }
  class AccessService {
    <<module>>
    +getCurrentAccess()
    +requireUser()
    +requireAdmin()
  }
  class ProfileService {
    <<module>>
    +getCurrentProfile()
    +updateCurrentProfile(input)
  }
  class AuthService {
    <<module>>
    +signInUser(credentials)
    +registerUser(registration)
    +requestEmailChange(email)
    +requestPasswordReset(email)
    +updatePassword(password)
    +signOutUser()
  }
  class CatalogService {
    <<module>>
    +listCatalogCategories()
    +listCatalogProducts(params)
    +getCatalogProduct(slug)
    +getCatalogProductsByIds(ids)
  }
  class CheckoutService {
    <<module>>
    +quoteCheckout(body)
    +createCheckoutOrder(body)
    +getCheckoutOrder(id)
  }
  class CatalogProduct
  class CheckoutQuote
  class CheckoutOrder

  CurrentAccess "1" --> "1" User : user
  UserProfile ..> User : id de la cuenta
  AccessService ..> CurrentAccess : devuelve
  ProfileService ..> UserProfile : devuelve
  AuthService ..> User : autentica
  CatalogService ..> CatalogProduct : devuelve
  CheckoutService ..> AccessService : requiere usuario
  CheckoutService ..> CheckoutQuote : cotiza
  CheckoutService ..> CheckoutOrder : crea y consulta
```

`User` pertenece a Supabase Auth. `AccountRole` admite `user` y `admin`; el código verifica el rol, sin una subclase Administrador. Los campos personales del perfil, salvo el nombre, admiten `null`. La pertenencia del pedido a la cuenta se verifica en el servicio mediante `customer_id`, aunque `CheckoutOrder` no expone ese atributo.

## Administración de productos

```mermaid
classDiagram
  class AdminCategory {
    +string id
    +string name
    +boolean isActive
  }
  class AdminProductDraft {
    +string id
    +string slug
    +string name
    +string categoryId
    +string description
    +ProductStatus status
  }
  class AdminVariantDraft {
    +string id
    +string name
    +string sku
    +string pricePen
    +string stockOnHand
    +number stockReserved
    +boolean isActive
  }
  class AdminProductImage {
    +string id
    +string storagePath
    +string externalUrl
    +string altText
    +boolean isReference
  }
  class AdminProductRepository {
    <<module>>
    +listAdminProducts(client)
    +getAdminProduct(client, id)
    +listAdminCategories(client)
    +saveAdminProduct(client, product, cover)
  }
  class AdminEngravingSettings {
    +string pricePen
    +number maxCharacters
    +boolean active
    +string categoryId
  }
  class AdminEngravingService {
    <<module>>
    +getAdminEngravingSettings()
    +updateAdminEngravingSettings(body)
  }

  AdminProductDraft --> AdminCategory : categoryId
  AdminProductDraft "1" *-- "0..*" AdminVariantDraft : variants
  AdminProductDraft "1" *-- "0..*" AdminProductImage : images opcionales
  AdminProductRepository ..> AdminProductDraft : lee y guarda
  AdminProductRepository ..> AdminCategory : lista
  AdminEngravingService ..> AdminEngravingSettings : lee y actualiza
  AdminEngravingSettings --> AdminCategory : categoryId
```

`ProductStatus` admite `draft`, `published` y `archived`. Los importes y existencias editables de administración son cadenas en los formularios; no tienen el mismo tipo que los valores numéricos del catálogo.

## Fuentes

- `src/features/catalogo/types/catalog.ts`
- `src/features/products/data/productsData.ts`
- `src/features/cart/types/cart.ts`
- `src/features/cart/context/CartContext.tsx`
- `src/features/checkout/types/checkout.ts`
- `src/features/checkout/services/checkoutService.ts`
- `src/features/auth/types/access.ts`
- `src/features/auth/services/accessService.ts`
- `src/features/auth/services/profileService.ts`
- `src/services/authService.ts`
- `src/features/catalogo/services/catalogService.ts`
- `src/features/admin-products/data/adminProducts.ts`
- `src/features/admin-products/data/adminProductRepository.ts`
- `src/features/checkout/services/adminEngravingService.ts`
