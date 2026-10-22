# Bahía Blanca 2559 — del plano a la casa

Landing con recorrido guiado por el scroll para la ampliación de la vivienda en Bahía Blanca 2559 (CABA), por NRVERTEX.

La página abre sobre la lámina de la planta alta, que es la obra, en tinta sobre papel. La lámina no es una imagen. Es el modelo 3D cortado a +1,20 m y visto desde arriba con una lente muy larga. Al scrollear, los muros suben desde el dibujo, la planta baja existente crece debajo y la cámara baja a la vereda. Después entra por la puerta y recorre los ambientes a la altura de los ojos. Cada ambiente sigue como dibujo de líneas hasta que llega la cámara, y ahí se revelan los materiales reales.

## Estado

- [x] Lámina de la planta alta (la obra): sus muros suben desde el dibujo y la planta baja crece debajo hasta +4,44.
- [x] Vereda, escalera y plataforma elevadora que suben juntas.
- [x] Recorrido de la planta alta, del frente al fondo: estar-comedor-cocina, balcón, vacío, vestidor, dormitorio PA|01, baño PA|02, dormitorio PA|03 y terraza.
- [x] Rótulos del plano en cada ambiente y vista aérea final de la obra.
- [x] Ascensor realista (la plataforma elevadora del plano, 1,15 × 1,00 m) con cabina vidriada hacia la sala.
- [x] Planta baja existente completa hasta el fondo del lote (48,22 m): UF 2, 3 y 4, pasillo común, patios bajo el vacío, aire y luz, las dos unidades del fondo con su planta alta y los patios del fondo. Al final se ve cortada a 2 m, como plano.

## Cómo verlo

Son archivos estáticos sin build. Hace falta servirlos por HTTP porque usa módulos ES:

```sh
npx http-server -p 8080 .
# o
python3 -m http.server 8080
```

Abrí `http://localhost:8080/`. Con `?record`, la página expone `window.__seek(p)` para renderizar cualquier punto del recorrido (p de 0 a 1) sin scroll. Así se graba el video de cada checkpoint.

## Estructura

| Archivo | Qué hace |
| --- | --- |
| `index.html` | Textos del recorrido y carga de three.js, GSAP + ScrollTrigger y Lenis desde CDN |
| `js/main.js` | Escena, luz de la tarde, cámara y línea de tiempo del scroll |
| `js/building.js` | El edificio con las medidas del plano aprobado: la obra nueva con materiales y el PH existente en blanco |
| `js/drawing.js` | La lámina de la planta alta: rótulos, cotas, puertas y carátula |
| `js/labels.js` | Rótulos del plano en el espacio: nombre del ambiente, PA\|xx, medidas y cotas |
| `js/materials.js` | Materiales que pasan de dibujo (papel, tinta, poché) a PBR con un barrido |
| `js/builder.js` | Muros con vanos, losas y unión de geometrías |
| `assets/textures/` | Texturas CC0 de ambientCG |

## Fuente

Plano de permiso de obra PLANO-2026-32354349-GCABA-DGROC (Obra civil, obra menor: modificación y ampliación de obra con demolición parcial; uso 9.2 vivienda colectiva). Todas las medidas salen de ese plano. Lo que el plano no define (mobiliario, materiales y algunas alturas) es una propuesta de diseño.
