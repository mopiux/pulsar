# Pulsa · configurador 3D

Configurador de teclados mecánicos para **Pulsa**, una marca ficticia de teclados armados a mano en Buenos Aires. El teclado arranca despiezado: las capas flotan y se encastran de abajo hacia arriba (carcasa, placa, switches, teclas, detalles) hasta cerrarse, girar 360° y mostrar el resumen.

## Cómo correrlo

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build de producción en dist/
```

## Qué hace

- **Armado por capas.** Cada capa flota con balanceo leve y se inclina siguiendo al mouse. La capa activa queda al frente, iluminada con un spot. Con **+ Encastrar** baja con un rebote y suena al apoyar; con **− Quitar** se separa la última. Tocar un paso ya hecho despieza desde ahí.
- **Modelo hecho por código** (no hay `public/models/teclado.glb`): carcasa extruida con biselado y base en cuña para la inclinación de escritura, placa visible, switches con vástago en cruz, teclas esculpidas por fila con leyendas, perilla moleteada y cable en espiral con `TubeGeometry`. Luz de estudio con `Environment` + `Lightformer` (sin descargar HDRs), `ContactShadows` y mesa de madera procedural.
- **Opciones:** 3 formatos (60%, 75%, TKL) con reacomodo animado tecla por tecla, 5 aluminios anodizados y policarbonato translúcido, 4 placas, 3 switches con sonido sintetizado (Web Audio), 4 juegos de teclas (Malbec, Río de la Plata, Yerba, Medianoche) con acentos de PBT o resina con transmisión, perilla, cable, retroiluminación apagada/fija/ola con Bloom, y grabado en vivo en la barra espaciadora.
- **Interacción:** arrastrar para rotar, rueda para zoom con límites, autorrotación en reposo, cámara que viaja según la categoría y que calcula la distancia para encuadrar el modelo en el espacio que deja libre la interfaz. Tipear en el teclado físico hunde la tecla del modelo y suena con el switch elegido.
- **Compartir:** la configuración se guarda en la URL (`?f=75&c=ciruela&...`); el link abre el mismo teclado armado.
- **Galería de la comunidad:** 6 teclados con filtros Recientes / Tendencia / Más votados, votos guardados en el navegador y “Abrir en el configurador”.
- **Encargar:** formulario con validación y confirmación de pedido.
- `prefers-reduced-motion`: sin autorrotación, sin viajes de cámara, sin giro final ni balanceo. Modo oscuro por `prefers-color-scheme`.

## Diseño

La dirección visual sale de `/referencias` y está en [`design-dna.json`](design-dna.json), generado con el skill **design-dna**: colores medidos con su script (recortando el marco oscuro de las capturas), tipografía Barlow Condensed / Barlow / Bungee Inline, cintas turquesa con subrayado mostaza a rojo, fondo de rombos, mesa de madera y la galería en bloque ciruela. La verificación del skill da ΔE medio 2,97 (configurador contra ref-1) y 3,15 (galería contra ref-2), con la deriva de cobertura dentro de umbral; el detalle está en `visual_effects.composite_notes`.

## Componentes

- **shadcn/ui** como base (button, toggle, toggle-group, tabs, dialog, tooltip, input, label, sonner), restilizados al DNA: esquinas vivas, mayúsculas condensadas, paleta de marca.
- Piezas puntuales adaptadas al DNA. Los registros de shadcn, Magic UI, Motion Primitives, React Bits y Aceternity están bloqueados por la red de este entorno, así que el código original se tomó de sus repos en GitHub y se adaptó:
  - `NumberTicker` (Magic UI) para el precio.
  - `GridPattern` (Magic UI), convertido en `DiamondPattern` para el arlequín de rombos.
  - `TextEffect` (Motion Primitives) para el título de cada paso.
  - `Carousel` (React Bits), base de `OptionCarousel` con arrastre, inercia y flechas.

## Estructura

```
src/
  three/        escena, teclado por capas, geometrías, materiales, cámara
  components/   configurador, galería, previews 2D, efectos y ui (shadcn)
  data/         catálogo y precios, layouts de teclas, galería
  store/        estado de la configuración (Zustand) y teclas presionadas
  audio/        sonidos sintetizados con Web Audio API
  hooks/        teclado físico, compartir, media queries
```
