import { useEffect, useState } from 'react'

const wikiCache = new Map()

async function fetchWikiPhoto(titles) {
  const key = titles.join('|')
  if (wikiCache.has(key)) return wikiCache.get(key)

  let src = null
  for (const t of titles) {
    const [lang, ...rest] = t.includes('::') ? t.split('::') : ['es', t]
    const title = rest.length ? rest.join('::') : t
    try {
      const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
      const r = await fetch(url)
      if (!r.ok) continue
      const j = await r.json()
      const img = j.thumbnail?.source || j.originalimage?.source
      if (img) {
        src = img
        break
      }
    } catch {
      // sigue con el siguiente idioma
    }
  }
  wikiCache.set(key, src)
  return src
}

// Reimplementa loadWikiPhoto del prototipo: solo busca foto si hay título(s) de Wikipedia conocidos
// (explícitos en el dato, o vía WIKI_TITLES). Sin "wiki" no se adivina por nombre — evita 404s.
export function useWikiPhoto(wiki) {
  const [url, setUrl] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setUrl(null)
    const titles = wiki ? (Array.isArray(wiki) ? wiki : [wiki]) : []
    if (!titles.length) return

    let cancelled = false
    setLoading(true)
    fetchWikiPhoto(titles).then(src => {
      if (!cancelled) {
        setUrl(src)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [wiki])

  return { url, loading }
}
