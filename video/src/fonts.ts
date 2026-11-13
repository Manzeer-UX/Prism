/**
 * The website's three typefaces, self-hosted from the same Fontsource packages.
 * Rendering waits until every weight the film uses has loaded.
 */
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import '@fontsource-variable/space-grotesk'
import { continueRender, delayRender } from 'remotion'

const faces = [
  '400 32px "Inter Variable"',
  '500 32px "Inter Variable"',
  '600 32px "Inter Variable"',
  '800 32px "Inter Variable"',
  '500 32px "Space Grotesk Variable"',
  '400 32px "JetBrains Mono Variable"',
]

if (typeof document !== 'undefined') {
  const handle = delayRender('Loading the website typefaces')
  Promise.all(faces.map((f) => document.fonts.load(f, 'PRISM AI 0123456789 Aa')))
    .then(() => document.fonts.ready)
    .then(() => continueRender(handle))
    .catch(() => continueRender(handle))
}
