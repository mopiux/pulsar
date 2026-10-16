// Genera los renders de la página Nosotros con el propio modelo 3D.
// Uso: con el servidor de desarrollo corriendo (npm run dev),
//   node scripts/render-assets.mjs [http://127.0.0.1:5173]
// Necesita Playwright con Chromium y sharp instalados.
import { createRequire } from "node:module"
import { mkdir } from "node:fs/promises"

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? "playwright")
const sharp = require(process.env.SHARP_PATH ?? "sharp")

const base = process.argv[2] ?? "http://127.0.0.1:5173"
const out = new URL("../public/renders/", import.meta.url)

const shots = [
  { file: "taller", query: "render=taller" },
  ...[1, 2, 3, 4, 5].map((n) => ({ file: `paso-${n}`, query: `render=taller&capas=${n}` })),
  { file: "equipo-carla", query: "render=equipo-carla" },
  { file: "equipo-julian", query: "render=equipo-julian" },
  { file: "equipo-rocio", query: "render=equipo-rocio" },
]

await mkdir(out, { recursive: true })
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] })
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1, reducedMotion: "reduce", colorScheme: "light" })

for (const shot of shots) {
  await page.goto(`${base}/?vitrina=1&${shot.query}`, { waitUntil: "networkidle" })
  await page.addStyleTag({ content: "html,body{background:transparent!important}" })
  await page.waitForTimeout(5000)
  // captura de la página entera: el lienzo cambia de pixel ratio y no queda "estable"
  const png = await page.screenshot({ omitBackground: true, timeout: 120000 })
  await sharp(png).trim({ threshold: 2 }).resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 86, alphaQuality: 90 })
    .toFile(new URL(`${shot.file}.webp`, out).pathname)
  console.log("render", shot.file)
}
await browser.close()
