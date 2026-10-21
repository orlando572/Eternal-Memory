-- Sample catalog: all products are drafts with zero stock and reference images.
-- Prices and options are copied from the local demo catalog, not verified inventory.
insert into public.categories (slug, name, sort_order) values
  ('urnas', 'Urnas', 10),
  ('ataudes', 'Ataúdes', 20),
  ('relicarios', 'Relicarios', 30),
  ('arreglos-florales', 'Arreglos florales', 40)
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'urna-serenidad-bronce', 'Urna Serenidad en bronce', 'Urna fabricada en bronce pulido con acabado mate y cierre hermético de alta seguridad.', 'En stock', 'moss', 'draft'
from public.categories c where c.slug = 'urnas'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Bronce Pulido', 480.00, 0 from public.products p where p.slug = 'urna-serenidad-bronce'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Bronce Envejecido', 480.00, 1 from public.products p where p.slug = 'urna-serenidad-bronce'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Urna Serenidad en bronce', true, 0 from public.products p where p.slug = 'urna-serenidad-bronce';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'urna-marmol-silencioso', 'Urna Mármol Silencioso', 'Mármol tallado a mano con vetas naturales únicas e interior pulido.', 'En stock', 'moss', 'draft'
from public.categories c where c.slug = 'urnas'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Mármol Blanco', 620.00, 0 from public.products p where p.slug = 'urna-marmol-silencioso'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Mármol Negro', 620.00, 1 from public.products p where p.slug = 'urna-marmol-silencioso'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Urna Mármol Silencioso', true, 0 from public.products p where p.slug = 'urna-marmol-silencioso';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'urna-organica-tierra', 'Urna Orgánica Tierra Viva', 'Biodegradable, elaborada con componentes minerales y orgánicos.', 'En stock', 'moss', 'draft'
from public.categories c where c.slug = 'urnas'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Tierra Natural', 390.00, 0 from public.products p where p.slug = 'urna-organica-tierra'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Urna Orgánica Tierra Viva', true, 0 from public.products p where p.slug = 'urna-organica-tierra';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'urna-roble-americano', 'Urna de Roble Americano', 'Estructura sólida en madera de roble natural con veta vista y herrajes discretos.', 'Personalizable', 'neutral', 'draft'
from public.categories c where c.slug = 'urnas'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Acabado Natural', 520.00, 0 from public.products p where p.slug = 'urna-roble-americano'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Tono Caoba', 520.00, 1 from public.products p where p.slug = 'urna-roble-americano'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Urna de Roble Americano', true, 0 from public.products p where p.slug = 'urna-roble-americano';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'urna-ceramica-esmeralda', 'Urna Cerámica Esmeralda', 'Cerámica cocida a alta temperatura con esmalte mineral en verde profundo.', 'En stock', 'moss', 'draft'
from public.categories c where c.slug = 'urnas'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Verde Esmeralda', 440.00, 0 from public.products p where p.slug = 'urna-ceramica-esmeralda'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Azul Noche', 440.00, 1 from public.products p where p.slug = 'urna-ceramica-esmeralda'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Urna Cerámica Esmeralda', true, 0 from public.products p where p.slug = 'urna-ceramica-esmeralda';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'urna-cristal-ambar', 'Urna de Cristal Ámbar Soplado', 'Pieza artesanal única elaborada en cristal soplado con reflejos cálidos.', 'Últimas unidades', 'ember', 'draft'
from public.categories c where c.slug = 'urnas'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Ámbar Solar', 590.00, 0 from public.products p where p.slug = 'urna-cristal-ambar'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Humo Translúcido', 590.00, 1 from public.products p where p.slug = 'urna-cristal-ambar'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Urna de Cristal Ámbar Soplado', true, 0 from public.products p where p.slug = 'urna-cristal-ambar';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'urna-nogal-cubo', 'Urna Cubo Nogal Minimalista', 'Diseño geométrico limpio fabricado en madera seleccionada de nogal.', 'Personalizable', 'neutral', 'draft'
from public.categories c where c.slug = 'urnas'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Nogal Oscuro', 490.00, 0 from public.products p where p.slug = 'urna-nogal-cubo'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Nogal Claro', 490.00, 1 from public.products p where p.slug = 'urna-nogal-cubo'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Urna Cubo Nogal Minimalista', true, 0 from public.products p where p.slug = 'urna-nogal-cubo';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'urna-acero-cepillado', 'Urna Cilindro en Acero', 'Cilindro con sellado perenne y acabado satinado de alta durabilidad.', 'En stock', 'moss', 'draft'
from public.categories c where c.slug = 'urnas'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Acero Satinado', 410.00, 0 from public.products p where p.slug = 'urna-acero-cepillado'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Negro Mate', 410.00, 1 from public.products p where p.slug = 'urna-acero-cepillado'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Urna Cilindro en Acero', true, 0 from public.products p where p.slug = 'urna-acero-cepillado';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'urna-granito-negro', 'Urna Granito Negro Espejo', 'Bloque de granito esculpido con grabado opcional en bajo relieve.', 'Personalizable', 'neutral', 'draft'
from public.categories c where c.slug = 'urnas'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Con Grabado', 680.00, 0 from public.products p where p.slug = 'urna-granito-negro'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Sin Grabado', 680.00, 1 from public.products p where p.slug = 'urna-granito-negro'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1584679109597-c656b19974c9?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Urna Granito Negro Espejo', true, 0 from public.products p where p.slug = 'urna-granito-negro';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'urna-sal-marina', 'Urna Marina Disolución', 'Diseñada con sal marina fosilizada para ceremonias respetuosas en el mar.', 'En stock', 'moss', 'draft'
from public.categories c where c.slug = 'urnas'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Disolución Rápida', 360.00, 0 from public.products p where p.slug = 'urna-sal-marina'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Disolución Progresiva', 360.00, 1 from public.products p where p.slug = 'urna-sal-marina'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Urna Marina Disolución', true, 0 from public.products p where p.slug = 'urna-sal-marina';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'urna-porcelana-dorada', 'Urna Porcelana con Oro', 'Fina porcelana blanca horneada con perfiles detallados en pan de oro.', 'Últimas unidades', 'ember', 'draft'
from public.categories c where c.slug = 'urnas'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Blanco Puro', 720.00, 0 from public.products p where p.slug = 'urna-porcelana-dorada'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Blanco Antiguo', 720.00, 1 from public.products p where p.slug = 'urna-porcelana-dorada'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Urna Porcelana con Oro', true, 0 from public.products p where p.slug = 'urna-porcelana-dorada';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'urna-alabastro-imperial', 'Urna de Alabastro Imperial', 'Alabastro natural con propiedades translúcidas y suave acabado pulido.', 'Personalizable', 'neutral', 'draft'
from public.categories c where c.slug = 'urnas'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Tono Cálido', 750.00, 0 from public.products p where p.slug = 'urna-alabastro-imperial'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Tono Marfil', 750.00, 1 from public.products p where p.slug = 'urna-alabastro-imperial'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Urna de Alabastro Imperial', true, 0 from public.products p where p.slug = 'urna-alabastro-imperial';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'ataud-roble-clasico', 'Ataúd Roble Clásico', 'Construido en madera de roble macizo con interiores tapizados en satén fino.', 'Personalizable', 'neutral', 'draft'
from public.categories c where c.slug = 'ataudes'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Acabado Caoba', 2100.00, 0 from public.products p where p.slug = 'ataud-roble-clasico'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Acabado Natural', 2100.00, 1 from public.products p where p.slug = 'ataud-roble-clasico'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Ataúd Roble Clásico', true, 0 from public.products p where p.slug = 'ataud-roble-clasico';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'ataud-cedro-imperial', 'Ataúd Cedro Imperial', 'Madera de cedro seleccionada con herrajes artesanales de bronce.', 'Personalizable', 'neutral', 'draft'
from public.categories c where c.slug = 'ataudes'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Barniz Brillante', 2850.00, 0 from public.products p where p.slug = 'ataud-cedro-imperial'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Barniz Mate', 2850.00, 1 from public.products p where p.slug = 'ataud-cedro-imperial'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Ataúd Cedro Imperial', true, 0 from public.products p where p.slug = 'ataud-cedro-imperial';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'ataud-caoba-presidencial', 'Ataúd Caoba Presidencial', 'Ebanistería fina en caoba maciza con esquineros decorativos en bronce torneado.', 'Últimas unidades', 'ember', 'draft'
from public.categories c where c.slug = 'ataudes'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Brillo Caoba', 3400.00, 0 from public.products p where p.slug = 'ataud-caoba-presidencial'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Caoba Antiguo', 3400.00, 1 from public.products p where p.slug = 'ataud-caoba-presidencial'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Ataúd Caoba Presidencial', true, 0 from public.products p where p.slug = 'ataud-caoba-presidencial';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'ataud-pino-ecologico', 'Ataúd Pino Natural Ecológico', 'Diseño sostenible libre de aditivos sintéticos, ideal para inhumación ecológica.', 'En stock', 'moss', 'draft'
from public.categories c where c.slug = 'ataudes'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Pino Crudo', 1450.00, 0 from public.products p where p.slug = 'ataud-pino-ecologico'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Pino Tratado al Agua', 1450.00, 1 from public.products p where p.slug = 'ataud-pino-ecologico'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Ataúd Pino Natural Ecológico', true, 0 from public.products p where p.slug = 'ataud-pino-ecologico';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'ataud-metalico-hermetico', 'Ataúd Metálico con Sellado', 'Protección metálica estanca con cierre sellado de alta resistencia.', 'En stock', 'moss', 'draft'
from public.categories c where c.slug = 'ataudes'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Gris Plomo', 2600.00, 0 from public.products p where p.slug = 'ataud-metalico-hermetico'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Bronce Oscuro', 2600.00, 1 from public.products p where p.slug = 'ataud-metalico-hermetico'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Ataúd Metálico con Sellado', true, 0 from public.products p where p.slug = 'ataud-metalico-hermetico';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'ataud-nogal-americano', 'Ataúd Nogal Americano', 'Vetas rectas y uniformes acompañadas de tapizado interior en terciopelo suave.', 'Personalizable', 'neutral', 'draft'
from public.categories c where c.slug = 'ataudes'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Tapiz Blanco', 2450.00, 0 from public.products p where p.slug = 'ataud-nogal-americano'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Tapiz Marfil', 2450.00, 1 from public.products p where p.slug = 'ataud-nogal-americano'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Ataúd Nogal Americano', true, 0 from public.products p where p.slug = 'ataud-nogal-americano';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'ataud-blanco-satinado', 'Ataúd Blanco Satinado', 'Laca satinada blanca en tono sobrio con herrajes plateados discretos.', 'Personalizable', 'neutral', 'draft'
from public.categories c where c.slug = 'ataudes'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Blanco Puro', 2250.00, 0 from public.products p where p.slug = 'ataud-blanco-satinado'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Blanco Perla', 2250.00, 1 from public.products p where p.slug = 'ataud-blanco-satinado'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Ataúd Blanco Satinado', true, 0 from public.products p where p.slug = 'ataud-blanco-satinado';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'ataud-acero-inoxidable', 'Ataúd Acero Inoxidable', 'Acabado pulido en acero quirúrgico 316 con máxima resistencia a la humedad.', 'Últimas unidades', 'ember', 'draft'
from public.categories c where c.slug = 'ataudes'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Acero Espejo', 3100.00, 0 from public.products p where p.slug = 'ataud-acero-inoxidable'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Acero Mate', 3100.00, 1 from public.products p where p.slug = 'ataud-acero-inoxidable'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Ataúd Acero Inoxidable', true, 0 from public.products p where p.slug = 'ataud-acero-inoxidable';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'ataud-mimbre-artesanal', 'Féretro de Mimbre Natural', 'Estructura tejida artesanalmente con fibras orgánicas y base reforzada.', 'En stock', 'moss', 'draft'
from public.categories c where c.slug = 'ataudes'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Mimbre Rubio', 1650.00, 0 from public.products p where p.slug = 'ataud-mimbre-artesanal'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Mimbre Rústico', 1650.00, 1 from public.products p where p.slug = 'ataud-mimbre-artesanal'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Féretro de Mimbre Natural', true, 0 from public.products p where p.slug = 'ataud-mimbre-artesanal';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'ataud-cerezo-pulido', 'Ataúd Madera de Cerezo', 'Color cálido distintivo del cerezo con tratamiento multicapa de barniz fino.', 'Personalizable', 'neutral', 'draft'
from public.categories c where c.slug = 'ataudes'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Cerezo Rojo', 2550.00, 0 from public.products p where p.slug = 'ataud-cerezo-pulido'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Cerezo Dorado', 2550.00, 1 from public.products p where p.slug = 'ataud-cerezo-pulido'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Ataúd Madera de Cerezo', true, 0 from public.products p where p.slug = 'ataud-cerezo-pulido';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'ataud-fresno-molduras', 'Ataúd Fresno con Molduras', 'Madera noble de fresno destacada por detalles lineales finamente tallados.', 'Personalizable', 'neutral', 'draft'
from public.categories c where c.slug = 'ataudes'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Fresno Claro', 2750.00, 0 from public.products p where p.slug = 'ataud-fresno-molduras'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Fresno Tostado', 2750.00, 1 from public.products p where p.slug = 'ataud-fresno-molduras'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Ataúd Fresno con Molduras', true, 0 from public.products p where p.slug = 'ataud-fresno-molduras';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'ataud-ebano-lineal', 'Ataúd Ébano Contemporáneo', 'Corte recto vanguardista en tono ébano mate para homenajes modernos y solemnes.', 'Últimas unidades', 'ember', 'draft'
from public.categories c where c.slug = 'ataudes'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Ébano Mate', 3600.00, 0 from public.products p where p.slug = 'ataud-ebano-lineal'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Ébano Satinado', 3600.00, 1 from public.products p where p.slug = 'ataud-ebano-lineal'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1584679109597-c656b19974c9?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Ataúd Ébano Contemporáneo', true, 0 from public.products p where p.slug = 'ataud-ebano-lineal';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'relicario-petalo-bronce', 'Relicario Pétalo Bronce', 'Pieza conmemorativa de mano esculpida en forma de pétalo sobrio.', 'Últimas unidades', 'ember', 'draft'
from public.categories c where c.slug = 'relicarios'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Única versión', 190.00, 0 from public.products p where p.slug = 'relicario-petalo-bronce'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Relicario Pétalo Bronce', true, 0 from public.products p where p.slug = 'relicario-petalo-bronce';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'relicario-cofre-cedro', 'Cofre Guardarecuerdos Cedro', 'Cofre acolchado con forro de terciopelo y cierre hermético de seguridad.', 'Personalizable', 'neutral', 'draft'
from public.categories c where c.slug = 'relicarios'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Interior Azul', 280.00, 0 from public.products p where p.slug = 'relicario-cofre-cedro'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Interior Borgoña', 280.00, 1 from public.products p where p.slug = 'relicario-cofre-cedro'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Cofre Guardarecuerdos Cedro', true, 0 from public.products p where p.slug = 'relicario-cofre-cedro';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'relicario-domo-cristal', 'Domo de Vidrio Guardián', 'Cúpula de vidrio transparente sobre base maciza de caoba.', 'En stock', 'moss', 'draft'
from public.categories c where c.slug = 'relicarios'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Base Caoba', 220.00, 0 from public.products p where p.slug = 'relicario-domo-cristal'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Base Nogal', 220.00, 1 from public.products p where p.slug = 'relicario-domo-cristal'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1513297887119-d46091b24bfa?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Domo de Vidrio Guardián', true, 0 from public.products p where p.slug = 'relicario-domo-cristal';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'relicario-bolsillo-peltre', 'Mini Relicario de Bolsillo', 'Estuche plano portátil elaborado en fino peltre con cierre seguro.', 'En stock', 'moss', 'draft'
from public.categories c where c.slug = 'relicarios'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Peltre Pulido', 140.00, 0 from public.products p where p.slug = 'relicario-bolsillo-peltre'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Peltre Envejecido', 140.00, 1 from public.products p where p.slug = 'relicario-bolsillo-peltre'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Mini Relicario de Bolsillo', true, 0 from public.products p where p.slug = 'relicario-bolsillo-peltre';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'relicario-caja-musical', 'Caja Musical Eterna Melodía', 'Mecanismo a cuerda tradicional con espacio reservado para pequeños recuerdos.', 'Personalizable', 'neutral', 'draft'
from public.categories c where c.slug = 'relicarios'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Melodía Canon', 310.00, 0 from public.products p where p.slug = 'relicario-caja-musical'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Melodía Clair de Lune', 310.00, 1 from public.products p where p.slug = 'relicario-caja-musical'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Caja Musical Eterna Melodía', true, 0 from public.products p where p.slug = 'relicario-caja-musical';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'relicario-mini-urnas', 'Set 4 Mini Urnas Familiares', 'Juego de 4 urnas individuales de latón preparadas para resguardo familiar.', 'En stock', 'moss', 'draft'
from public.categories c where c.slug = 'relicarios'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Latón Dorado', 340.00, 0 from public.products p where p.slug = 'relicario-mini-urnas'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Latón Plateado', 340.00, 1 from public.products p where p.slug = 'relicario-mini-urnas'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Set 4 Mini Urnas Familiares', true, 0 from public.products p where p.slug = 'relicario-mini-urnas';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'relicario-libro-piel', 'Libro Memorial en Cuero', 'Libro de firmas y guarda forrado en cuero genuino libre de ácidos.', 'Personalizable', 'neutral', 'draft'
from public.categories c where c.slug = 'relicarios'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Cuero Marrón', 180.00, 0 from public.products p where p.slug = 'relicario-libro-piel'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Cuero Negro', 180.00, 1 from public.products p where p.slug = 'relicario-libro-piel'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Libro Memorial en Cuero', true, 0 from public.products p where p.slug = 'relicario-libro-piel';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'relicario-cristal-corazon', 'Corazón Cristal Murano', 'Pieza de autor en cristal de Murano con cavidad sellable para cenizas.', 'Últimas unidades', 'ember', 'draft'
from public.categories c where c.slug = 'relicarios'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Cristal Transparente', 260.00, 0 from public.products p where p.slug = 'relicario-cristal-corazon'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Cristal Cobalto', 260.00, 1 from public.products p where p.slug = 'relicario-cristal-corazon'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Corazón Cristal Murano', true, 0 from public.products p where p.slug = 'relicario-cristal-corazon';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'relicario-rosario-plata', 'Estuche de Plata para Rosario', 'Guarda protectora de plata con bisagra oculta y paño protector.', 'En stock', 'moss', 'draft'
from public.categories c where c.slug = 'relicarios'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Plata Pulida', 210.00, 0 from public.products p where p.slug = 'relicario-rosario-plata'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Plata Satinada', 210.00, 1 from public.products p where p.slug = 'relicario-rosario-plata'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1590548784585-643d2b9f2925?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Estuche de Plata para Rosario', true, 0 from public.products p where p.slug = 'relicario-rosario-plata';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'relicario-marco-fotografico', 'Marco de Madera con Guarda', 'Marco de sobremesa para fotografía con compartimento posterior estanco.', 'Personalizable', 'neutral', 'draft'
from public.categories c where c.slug = 'relicarios'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Madera de Roble', 230.00, 0 from public.products p where p.slug = 'relicario-marco-fotografico'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Madera de Cerezo', 230.00, 1 from public.products p where p.slug = 'relicario-marco-fotografico'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Marco de Madera con Guarda', true, 0 from public.products p where p.slug = 'relicario-marco-fotografico';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'relicario-lampara-sal', 'Lámpara Relicario de Sal', 'Luz cálida relajante con bloque de sal natural y cavidad de custodia interior.', 'En stock', 'moss', 'draft'
from public.categories c where c.slug = 'relicarios'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Tono Ámbar', 250.00, 0 from public.products p where p.slug = 'relicario-lampara-sal'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Tono Rosado', 250.00, 1 from public.products p where p.slug = 'relicario-lampara-sal'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Lámpara Relicario de Sal', true, 0 from public.products p where p.slug = 'relicario-lampara-sal';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'relicario-capsula-tiempo', 'Cápsula de Tiempo Hermética', 'Cilindro de acero anticorrosión apto para preservar recuerdos de forma permanente.', 'En stock', 'moss', 'draft'
from public.categories c where c.slug = 'relicarios'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, '20 cm', 195.00, 0 from public.products p where p.slug = 'relicario-capsula-tiempo'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, '30 cm', 195.00, 1 from public.products p where p.slug = 'relicario-capsula-tiempo'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Cápsula de Tiempo Hermética', true, 0 from public.products p where p.slug = 'relicario-capsula-tiempo';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'corona-botanica-romero', 'Corona Botánica Silvestre', 'Arreglo con especies botánicas frescas y follaje de romero y eucalipto.', 'Envío en 24h', 'brass', 'draft'
from public.categories c where c.slug = 'arreglos-florales'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Tamaño Estándar', 260.00, 0 from public.products p where p.slug = 'corona-botanica-romero'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Tamaño Grande', 260.00, 1 from public.products p where p.slug = 'corona-botanica-romero'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Corona Botánica Silvestre', true, 0 from public.products p where p.slug = 'corona-botanica-romero';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'centro-orquideas-lirios', 'Centro de Orquídeas y Lirios', 'Centro floral con orquídeas blancas y lirios seleccionados.', 'Envío en 24h', 'brass', 'draft'
from public.categories c where c.slug = 'arreglos-florales'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Blanco Puro', 310.00, 0 from public.products p where p.slug = 'centro-orquideas-lirios'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Marfil', 310.00, 1 from public.products p where p.slug = 'centro-orquideas-lirios'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Centro de Orquídeas y Lirios', true, 0 from public.products p where p.slug = 'centro-orquideas-lirios';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'ramo-condolencias-paz', 'Ramo Condolencias Paz Eterna', 'Ramillete en tonos claros envuelto en papel satinado biodegradable.', 'Envío en 24h', 'brass', 'draft'
from public.categories c where c.slug = 'arreglos-florales'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Rosas Blancas', 180.00, 0 from public.products p where p.slug = 'ramo-condolencias-paz'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Lirios y Crisantemos', 180.00, 1 from public.products p where p.slug = 'ramo-condolencias-paz'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Ramo Condolencias Paz Eterna', true, 0 from public.products p where p.slug = 'ramo-condolencias-paz';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'centro-mesa-conmemorativo', 'Centro de Mesa Capilla', 'Composición floral baja con flores de estación y follaje suave de eucalipto.', 'Envío en 24h', 'brass', 'draft'
from public.categories c where c.slug = 'arreglos-florales'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, '60 cm', 220.00, 0 from public.products p where p.slug = 'centro-mesa-conmemorativo'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, '80 cm', 220.00, 1 from public.products p where p.slug = 'centro-mesa-conmemorativo'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Centro de Mesa Capilla', true, 0 from public.products p where p.slug = 'centro-mesa-conmemorativo';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'manto-floral-feretro', 'Manto Floral para Féretro', 'Cobertura superior completa compuesta por rosas frescas, hortensias y verde fino.', 'Envío en 24h', 'brass', 'draft'
from public.categories c where c.slug = 'arreglos-florales'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Largo Completo (1.40m)', 480.00, 0 from public.products p where p.slug = 'manto-floral-feretro'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Medio Manto (90cm)', 480.00, 1 from public.products p where p.slug = 'manto-floral-feretro'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Manto Floral para Féretro', true, 0 from public.products p where p.slug = 'manto-floral-feretro';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'corona-rosas-rojas', 'Corona de Rosas Rojas', 'Corona tradicional densamente poblada con rosas rojas de exportación.', 'Envío en 24h', 'brass', 'draft'
from public.categories c where c.slug = 'arreglos-florales'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, '80 cm Diámetro', 320.00, 0 from public.products p where p.slug = 'corona-rosas-rojas'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, '100 cm Diámetro', 320.00, 1 from public.products p where p.slug = 'corona-rosas-rojas'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Corona de Rosas Rojas', true, 0 from public.products p where p.slug = 'corona-rosas-rojas';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'palma-funeral-gladiolos', 'Palma Fúnebre de Simpatía', 'Palma de pie armada con gladiolos blancos y follaje seleccionado sobre pedestal.', 'Envío en 24h', 'brass', 'draft'
from public.categories c where c.slug = 'arreglos-florales'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Blanco Puro', 195.00, 0 from public.products p where p.slug = 'palma-funeral-gladiolos'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Blanco y Amarillo Suave', 195.00, 1 from public.products p where p.slug = 'palma-funeral-gladiolos'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Palma Fúnebre de Simpatía', true, 0 from public.products p where p.slug = 'palma-funeral-gladiolos';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'corazon-rosas-blancas', 'Corazón Floral en Relieve', 'Estructura en forma de corazón con rosas blancas compactas y borde perimetral verde.', 'Envío en 24h', 'brass', 'draft'
from public.categories c where c.slug = 'arreglos-florales'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, '70 cm', 380.00, 0 from public.products p where p.slug = 'corazon-rosas-blancas'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, '90 cm', 380.00, 1 from public.products p where p.slug = 'corazon-rosas-blancas'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Corazón Floral en Relieve', true, 0 from public.products p where p.slug = 'corazon-rosas-blancas';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'arreglo-pedestal-alto', 'Arreglo en Pedestal Ceremonial', 'Composición vertical provista con base estable para accesos o laterales de capilla.', 'Envío en 24h', 'brass', 'draft'
from public.categories c where c.slug = 'arreglos-florales'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Base Dorada', 270.00, 0 from public.products p where p.slug = 'arreglo-pedestal-alto'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Base Negra', 270.00, 1 from public.products p where p.slug = 'arreglo-pedestal-alto'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Arreglo en Pedestal Ceremonial', true, 0 from public.products p where p.slug = 'arreglo-pedestal-alto';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'canasta-campestre-flores', 'Canasta Campestre Memorial', 'Cesta de mimbre tradicional armada con flores silvestres de tonos cálidos.', 'Envío en 24h', 'brass', 'draft'
from public.categories c where c.slug = 'arreglos-florales'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Tonos Pastel', 210.00, 0 from public.products p where p.slug = 'canasta-campestre-flores'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Tonos Blancos', 210.00, 1 from public.products p where p.slug = 'canasta-campestre-flores'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Canasta Campestre Memorial', true, 0 from public.products p where p.slug = 'canasta-campestre-flores';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'corona-orquideas-blancas', 'Corona Exclusiva de Orquídeas', 'Arreglo solemne confeccionado con orquídeas Phalaenopsis y toques de verde importado.', 'Envío en 24h', 'brass', 'draft'
from public.categories c where c.slug = 'arreglos-florales'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Orquídeas Blancas', 520.00, 0 from public.products p where p.slug = 'corona-orquideas-blancas'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, 'Orquídeas Marfil', 520.00, 1 from public.products p where p.slug = 'corona-orquideas-blancas'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Corona Exclusiva de Orquídeas', true, 0 from public.products p where p.slug = 'corona-orquideas-blancas';

insert into public.products (category_id, slug, name, description, badge, badge_tone, status)
select c.id, 'guirnalda-eucalipto-altar', 'Guirnalda de Eucalipto y Rosas', 'Guirnalda longitudinal aromática para decorar altares, retablos o el pie del féretro.', 'Envío en 24h', 'brass', 'draft'
from public.categories c where c.slug = 'arreglos-florales'
on conflict (slug) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, '1.50 metros', 240.00, 0 from public.products p where p.slug = 'guirnalda-eucalipto-altar'
on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, name, price_pen, sort_order)
select p.id, '2.00 metros', 240.00, 1 from public.products p where p.slug = 'guirnalda-eucalipto-altar'
on conflict (product_id, name) do nothing;
insert into public.product_images (product_id, external_url, alt_text, is_reference, sort_order)
select p.id, 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=800&q=80', 'Imagen referencial de Guirnalda de Eucalipto y Rosas', true, 0 from public.products p where p.slug = 'guirnalda-eucalipto-altar';

