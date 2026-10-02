# Pulsa · configurador 3D

Configurador de teclados mecánicos para **Pulsa**, una marca ficticia de teclados armados a mano en Buenos Aires. El teclado arranca despiezado: las capas flotan y se encastran de abajo hacia arriba (carcasa, placa, switches, teclas, detalles) hasta cerrarse, girar 360° y mostrar el resumen.

## Cómo correrlo

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build de producción en dist/
```

## Qué hace

- **Pantalla completa, sin scroll.** La app ocupa exactamente el alto de la pantalla. “Armá el tuyo” y “Galería” son dos vistas que se cruzan con un fundido; el 3D queda montado y en pausa mientras se mira la galería.
- **Armado por capas.** Las capas flotan con balanceo leve y se inclinan siguiendo al mouse. La activa queda al frente e iluminada. **+ Encastrar** la baja con rebote y sonido; **−** separa la última. Al completar, gira 360° y aparece el resumen.
- **Modelo hecho por código:** carcasa biselada en cuña, placa, switches, teclas esculpidas por fila, perilla moleteada y cable en espiral, sobre una superficie mate de estudio con sombra de contacto.
- **Opciones:** 3 formatos con reacomodo animado, 5 aluminios y policarbonato, 4 placas, 3 switches con sonido sintetizado, 4 juegos de teclas, perilla, cable, luces apagada/fija/ola y grabado en vivo.
- **Cámara:** cada categoría tiene su ángulo, siempre con el teclado completo en cuadro (el encuadre se calcula según el espacio que deja la interfaz). La rueda solo hace un zoom corto (±20%) y nunca desplaza la página.
- **Mobile:** el modelo ocupa al menos el 55% de la pantalla y el panel va abajo; arrastrar el modelo no mueve la página.
- Tipeo desde el teclado físico, configuración compartible por URL, galería con filtros y votos, pedido con validación, `prefers-reduced-motion` y modo oscuro.

## Rendimiento

- Teclas y switches instanciados (`InstancedMesh`): un mesh por combinación de ancho, fila y material. Todas las leyendas salen de un único atlas en un solo draw call.
- `frameloop="demand"`: se dibuja solo cuando algo se mueve. El balanceo y la autorrotación corren mientras hay actividad reciente y se apagan solos a los 30 s.
- `PerformanceMonitor` baja el pixel ratio si caen los FPS y pasa a calidad baja si no alcanza.
- Mobile arranca en calidad baja: resina y policarbonato sin transmisión, sombras a 256 px, sin antialias de hardware.
- Bloom solo con la retroiluminación prendida. El 3D se carga en diferido con una silueta de carga.

## Diseño

Estudio de producto claro, tipo catálogo: gris cálido casi blanco con un degradé sutil, Geist como única tipografía, un solo acento azul para las acciones principales y la interfaz en neutros. El detalle está en [`design-dna.json`](design-dna.json). De las referencias solo se tomó la mecánica.

Componentes: shadcn/ui como base, más piezas adaptadas de Magic UI (`NumberTicker`), Motion Primitives (`TextEffect`) y React Bits (`Carousel`). Sus registros están bloqueados en este entorno, así que el código se tomó de sus repos en GitHub.

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
