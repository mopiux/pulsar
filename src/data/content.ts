import type { Config } from "./catalog"

/*
  Contenido de la tienda. Pulsa es una marca ficticia: el taller, el equipo
  y las reseñas son inventados para la demostración.
*/

export const CONTACT = {
  email: "hola@pulsa.ar",
  whatsapp: "+54 9 11 5555-0142",
  hours: "Lunes a viernes de 11 a 19",
  area: "Villa Crespo, Ciudad de Buenos Aires",
}

export const SOCIALS = [
  { id: "instagram", label: "Instagram", handle: "@pulsa.teclados" },
  { id: "youtube", label: "YouTube", handle: "Pulsa Taller" },
  { id: "tiktok", label: "TikTok", handle: "@pulsa.taller" },
] as const

export const HISTORY = [
  "Pulsa empezó en 2019 en un departamento de Villa Crespo, con una placa, un soldador y un teclado que sonaba mal. Lo desarmamos, lo lubricamos switch por switch y entendimos que un teclado se arma en capas, como cualquier cosa bien hecha.",
  "Hoy somos tres en un taller chico a pocas cuadras de ahí. Cada Pulsa se arma a mano, de abajo hacia arriba, y se prueba tecla por tecla antes de salir. No hacemos tiradas grandes: armamos lo que vos configurás.",
]

export interface ProcessStep {
  id: string
  title: string
  text: string
  image: string
}

export const PROCESS: ProcessStep[] = [
  {
    id: "carcasa",
    title: "La carcasa",
    text: "Aluminio fresado y anodizado, o policarbonato. Es la base: le revisamos el asiento y le pegamos los pies antes de seguir.",
    image: "/renders/paso-1.webp",
  },
  {
    id: "placa",
    title: "La placa",
    text: "La atornillamos sobre juntas que absorben el golpe. El material cambia el sonido: el latón suena grave, el policarbonato blando.",
    image: "/renders/paso-2.webp",
  },
  {
    id: "switches",
    title: "Los switches",
    text: "Los abrimos uno por uno, los lubricamos y los cerramos. Es la parte más lenta y la que más se nota cuando tipeás.",
    image: "/renders/paso-3.webp",
  },
  {
    id: "teclas",
    title: "Las teclas",
    text: "Perfil escalonado, PBT de doble inyección o leyendas shine-through. Revisamos que cada fila asiente pareja.",
    image: "/renders/paso-4.webp",
  },
  {
    id: "detalles",
    title: "Los detalles",
    text: "Perilla, cable en espiral, luces y el grabado de la barra. Después lo tipeamos un rato largo antes de cerrar la caja.",
    image: "/renders/paso-5.webp",
  },
]

export interface TeamMember {
  name: string
  role: string
  bio: string
  image: string
  build: string
}

export const TEAM: TeamMember[] = [
  {
    name: "Carla Mendieta",
    role: "Fundadora, armado",
    bio: "Armó el primer Pulsa y todavía revisa cada placa antes de que se cierre una carcasa.",
    image: "/renders/equipo-carla.webp",
    build: "Usa un 75% Noche con switches táctiles y teclas Medianoche.",
  },
  {
    name: "Julián Ocampo",
    role: "Carcasas y terminaciones",
    bio: "Viene de la carpintería. Se encarga del fresado, el anodizado y que todo cierre al décimo de milímetro.",
    image: "/renders/equipo-julian.webp",
    build: "Usa un TKL Plata con switches lineales y teclas Yerba.",
  },
  {
    name: "Rocío Paz",
    role: "Sonido y atención",
    bio: "Lubrica switches mientras contesta mensajes. Si tenés dudas sobre qué switch elegir, te responde ella.",
    image: "/renders/equipo-rocio.webp",
    build: "Usa un 60% Arena con switches clicky y teclas Río de la Plata.",
  },
]

/** Configuraciones de los renders del equipo y del taller (para regenerarlos). */
export const RENDER_CONFIGS: Record<string, Config> = {
  taller: {
    format: "75",
    case: "noche",
    plate: "aluminio",
    switches: "tactil",
    keycaps: "rio",
    knob: "aluminio",
    cable: "hueso",
    rgbMode: "apagada",
    rgbColor: "#ffe2b8",
    engraving: "",
  },
  "equipo-carla": {
    format: "75",
    case: "noche",
    plate: "laton",
    switches: "tactil",
    keycaps: "medianoche",
    knob: "laton",
    cable: "coral",
    rgbMode: "fija",
    rgbColor: "#ff9a2e",
    engraving: "",
  },
  "equipo-julian": {
    format: "tkl",
    case: "plata",
    plate: "aluminio",
    switches: "lineal",
    keycaps: "yerba",
    knob: "ninguna",
    cable: "salvia",
    rgbMode: "apagada",
    rgbColor: "#ffe2b8",
    engraving: "",
  },
  "equipo-rocio": {
    format: "60",
    case: "arena",
    plate: "policarbonato",
    switches: "clicky",
    keycaps: "rio",
    knob: "ninguna",
    cable: "hueso",
    rgbMode: "apagada",
    rgbColor: "#ffe2b8",
    engraving: "",
  },
}

export interface Review {
  name: string
  city: string
  rating: number
  date: string
  text: string
  config: Config
}

export const REVIEWS: Review[] = [
  {
    name: "Agustina Ledesma",
    city: "Rosario",
    rating: 5,
    date: "2026-09-12",
    text: "Llegó en 19 días, mejor embalado que cualquier cosa que haya comprado. Los táctiles con placa de latón suenan como pedí.",
    config: { format: "75", case: "arena", plate: "laton", switches: "tactil", keycaps: "malbec", knob: "laton", cable: "hueso", rgbMode: "apagada", rgbColor: "#ffe2b8", engraving: "" },
  },
  {
    name: "Matías Cabral",
    city: "Córdoba",
    rating: 5,
    date: "2026-08-27",
    text: "Programo ocho horas por día y se nota. El TKL con lineales es silencioso para las reuniones y la barra grabada me encanta.",
    config: { format: "tkl", case: "grafito", plate: "fr4", switches: "lineal", keycaps: "medianoche", knob: "ninguna", cable: "grafito", rgbMode: "fija", rgbColor: "#ffe2b8", engraving: "Compila, por favor" },
  },
  {
    name: "Sofía Giménez",
    city: "La Plata",
    rating: 4,
    date: "2026-08-03",
    text: "Hermoso y muy bien armado. Le saco una estrella porque el cable en espiral es más corto de lo que imaginaba.",
    config: { format: "60", case: "salvia", plate: "aluminio", switches: "lineal", keycaps: "yerba", knob: "ninguna", cable: "salvia", rgbMode: "apagada", rgbColor: "#ffe2b8", engraving: "" },
  },
  {
    name: "Nicolás Ferreyra",
    city: "CABA",
    rating: 5,
    date: "2026-07-21",
    text: "Lo retiré en el taller y Rocío me dejó probar los tres switches antes de cerrar. Terminé en clicky y no me arrepiento.",
    config: { format: "75", case: "plata", plate: "aluminio", switches: "clicky", keycaps: "rio", knob: "aluminio", cable: "hueso", rgbMode: "ola", rgbColor: "#5ec8ff", engraving: "" },
  },
  {
    name: "Lucía Aranda",
    city: "Mendoza",
    rating: 5,
    date: "2026-07-02",
    text: "El policarbonato con la luz fija queda increíble de noche. Atención impecable cuando tuve que cambiar la dirección de envío.",
    config: { format: "60", case: "hielo", plate: "policarbonato", switches: "tactil", keycaps: "rio", knob: "ninguna", cable: "coral", rgbMode: "fija", rgbColor: "#ff5fa8", engraving: "" },
  },
  {
    name: "Federico Ibarra",
    city: "Mar del Plata",
    rating: 5,
    date: "2026-06-14",
    text: "Es mi segundo Pulsa. El primero tiene cuatro años y sigue como nuevo, así que este fue para mi viejo.",
    config: { format: "tkl", case: "noche", plate: "laton", switches: "tactil", keycaps: "malbec", knob: "laton", cable: "grafito", rgbMode: "apagada", rgbColor: "#ffe2b8", engraving: "Para Carlos" },
  },
]

export interface Faq {
  q: string
  a: string
}

export const FAQS: Faq[] = [
  {
    q: "¿Cuánto tarda en llegar mi teclado?",
    a: "Lo armamos a mano en unas 3 semanas desde que se acredita el pago. Después se suma el envío: 24 a 48 h en CABA, 2 a 3 días hábiles en GBA y 3 a 6 en el resto del país.",
  },
  {
    q: "¿Qué switch me conviene?",
    a: "Lineal si querés un recorrido suave y silencioso, táctil si te gusta sentir cuándo se registra la tecla, clicky si además querés escucharlo. En el configurador cada uno suena distinto: probalos con tu teclado.",
  },
  {
    q: "¿Puedo cambiar las teclas o los switches más adelante?",
    a: "Sí. Todos los Pulsa son hot-swap: los switches salen sin soldar y las teclas usan montura MX estándar, así que podés cambiarlos vos o pedirnos un juego nuevo.",
  },
  {
    q: "¿Funciona con Mac, Windows y Linux?",
    a: "Sí, sin drivers. La perilla controla el volumen y con Fn tenés accesos para multimedia. Las luces se configuran desde el propio teclado.",
  },
  {
    q: "¿Qué distribución tienen las teclas?",
    a: "ANSI con leyendas en inglés y modificadores en castellano. Si necesitás ISO o leyendas en español con Ñ, escribinos antes de encargar y lo armamos así.",
  },
  {
    q: "¿Qué medios de pago aceptan?",
    a: "Tarjeta de crédito en hasta 6 cuotas sin interés, débito y transferencia con 10% de descuento (te pasamos los datos por mail).",
  },
  {
    q: "¿Hacen factura A?",
    a: "Sí. Escribinos con tu CUIT después de encargar y la emitimos antes del envío.",
  },
  {
    q: "¿Puedo ir a probar teclados al taller?",
    a: "Sí, con turno. Tenemos los tres switches y las cuatro placas armadas para que los compares. Pedí el tuyo por WhatsApp.",
  },
]

export const SHIPPING_INFO = [
  { title: "CABA", text: "Moto en 24 a 48 h desde que sale del taller. $ 6.500." },
  { title: "Gran Buenos Aires", text: "Correo en 2 a 3 días hábiles. $ 9.800." },
  { title: "Resto del país", text: "Correo a domicilio o sucursal en 3 a 6 días hábiles. $ 14.500." },
  { title: "Retiro en el taller", text: "Sin cargo, en Villa Crespo, con aviso por mail cuando esté listo." },
]

export const WARRANTY = [
  "12 meses de garantía en todo el teclado: carcasa, placa, switches, electrónica y cable.",
  "Si algo falla, te mandamos una etiqueta de envío prepaga, lo revisamos y te lo devolvemos reparado o cambiado en menos de 10 días hábiles.",
  "La garantía no cubre golpes, líquidos derramados ni modificaciones de terceros, pero igual podemos repararlo con presupuesto.",
]

export const RETURNS = [
  "Tenés 10 días corridos desde que lo recibís para arrepentirte de la compra con el botón de arrepentimiento, al pie de esta página.",
  "La devolución no tiene costo para vos: te mandamos la etiqueta de envío y te reintegramos el total con el mismo medio de pago.",
  "Si llegó con un defecto o no coincide con lo encargado, lo cambiamos o te devolvemos el dinero, también sin costo.",
]

export interface LegalDoc {
  id: "terminos" | "privacidad" | "arrepentimiento"
  title: string
  body: string[]
}

export const LEGAL: LegalDoc[] = [
  {
    id: "terminos",
    title: "Términos y condiciones",
    body: [
      "Pulsa es una tienda de demostración: no se venden productos ni se procesan pagos reales.",
      "Los precios están expresados en pesos argentinos e incluyen IVA. La configuración que encargás es la que armamos; los colores pueden variar levemente respecto de la vista 3D.",
      "El plazo de armado es estimado y te lo confirmamos por mail al acreditarse el pago.",
    ],
  },
  {
    id: "privacidad",
    title: "Política de privacidad",
    body: [
      "Usamos tus datos solo para preparar y enviar tu pedido y responder tus consultas. No los compartimos con terceros salvo el correo que hace la entrega.",
      "En esta demostración, el carrito, los votos y los pedidos se guardan únicamente en tu navegador. Podés borrarlos limpiando los datos del sitio.",
      "Podés pedir acceso, corrección o eliminación de tus datos escribiendo a nuestro mail (Ley 25.326).",
    ],
  },
  {
    id: "arrepentimiento",
    title: "Botón de arrepentimiento",
    body: [
      "Si te arrepentiste de una compra, tenés 10 días corridos desde que recibiste el producto para revocarla (art. 34 de la Ley 24.240).",
      "Escribinos con tu número de pedido por mail o WhatsApp y te respondemos en 24 h hábiles con la etiqueta para devolverlo.",
    ],
  },
]
