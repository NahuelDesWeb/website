# Prompts de imagen · carrusel "Vidriera vs. local abierto"

Cómo usarlos: generá la imagen afuera y guardala **con este nombre exacto** en `assets/imagenes/`. El HTML la toma solo; después corré `node export.js` para regenerar los PNG.

**Estilo común:** fotografía realista, cinematográfica y sobria; barrio porteño (CABA); luz de noche cálida; sombras profundas casi negras (`#0D0D0D`) y **un único acento violeta suave (`#B69CFF`)** como luz de neón o reflejo. Sin texto legible, sin logos, sin marcas, sin personas reconocibles, sin look de stock. Es la misma línea de la foto del hero de nrvertex.com (interior oscuro, luz cálida, gente real mirando el celular).

---

## Lámina 1 · `assets/imagenes/lamina-1.png`
**Tamaño:** 1624×700 px (apaisado ≈2.3:1; en pantalla se ve a 812×349).

> Fotografía nocturna de la vidriera de un local de barrio en Buenos Aires, tomada de frente y a la altura de los ojos. Adentro, estantes con productos de un negocio de oficio (florería, ferretería o peluquería) iluminados con luz cálida; el local se ve vacío, con el cartel de "abierto" apagado o sin texto. Reflejo suave de luz violeta (#B69CFF) sobre el vidrio. Fondo y vereda en negro profundo (#0D0D0D). Composición horizontal con el sujeto en el centro y aire arriba y abajo. Estética cinematográfica, realista, poco contraste de color, sin texto legible, sin logos.

## Lámina 2 · `assets/imagenes/lamina-2.png`
**Tamaño:** 1624×880 px (apaisado ≈1.85:1; en pantalla se ve a 812×439).

> Primer plano de una persona en la vereda de noche, de espaldas o de perfil sin rostro identificable, mirando un celular. La pantalla emite una luz violeta suave (#B69CFF) sobre sus manos y su campera oscura. Al fondo, desenfocadas, las luces de varios locales de barrio en una calle de CABA, que sugieren "muchas opciones". Sin texto legible en la pantalla. Fondo negro profundo (#0D0D0D), profundidad de campo corta, estilo fotográfico realista y cinematográfico.

## Lámina 4 · `assets/imagenes/lamina-4.png`
**Tamaño:** 1080×1350 px (vertical 4:5, pantalla completa).

> Fotografía vertical a pantalla completa de la fachada de un negocio de barrio porteño de noche, con la vidriera encendida y cálida. **Todo el sujeto en la mitad superior de la imagen**; la mitad inferior queda en sombra casi negra (#0D0D0D), porque ahí va una tarjeta de texto. Una persona dentro del local, de espaldas o desenfocada, atendiendo con naturalidad. Luz de acento violeta suave (#B69CFF) en el borde del vidrio. Realista, cinematográfica, sin texto legible, sin logos, sin marcas.

---

### Notas
- Lámina 3 no necesita prompt: usa la captura real de `https://nrvertex.com` (`assets/nrvertex-hero.png`).
- Si querés fotos reales de clientes, pedí autorización antes de usarlas.

---

## Versión estados de WhatsApp (1080×1920)
Los estados usan otros recortes. Podés reusar el mismo prompt de cada lámina pidiendo estos tamaños y guardando con estos nombres:

| Lámina | Archivo en `assets/imagenes/` | Tamaño a generar | Nota |
|---|---|---|---|
| 1 | `estado-1.png` | 1624×1174 (≈1.4:1) | Más alta que la del feed: dejá más aire arriba y abajo. |
| 2 | `estado-2.png` | 1624×1216 (≈1.33:1) | Igual que arriba. |
| 4 | `estado-4.png` | 1080×1920 (9:16, pantalla completa) | Sujeto en el **40 % superior**; el resto en sombra, porque ahí va la tarjeta de texto. |

Para usarlas en los estados, cambiá el `data-img` de `html/estado-N.html` a `../assets/imagenes/estado-N.png` y corré `node export-estados.js`.
