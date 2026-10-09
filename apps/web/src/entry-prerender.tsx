// Build-time renderer: bakes the marketing homepage into dist/index.html
// so search engines and no-JS clients receive the full text.
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import LandingPage from './pages/LandingPage'

export function render() {
  return renderToString(
    <StaticRouter location="/">
      <LandingPage />
    </StaticRouter>
  )
}
