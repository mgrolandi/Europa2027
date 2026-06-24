import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../../styles/atlas.css'
import { useWikiPhoto } from './useWikiPhoto'
import { WIKI_TITLES } from './wikiTitles'

const TYPES = {
  monumento: { label: 'Monumentos',    color: '#3f6b80', letter: 'M' },
  ocio:      { label: 'Ocio y cultura', color: '#6f7d3f', letter: 'O' },
  comida:    { label: 'Comer y beber',  color: '#b5462f', letter: 'C' },
  tienda:    { label: 'Compras',        color: '#8a5a9e', letter: 'T' },
  hotel:     { label: 'Alojamiento',    color: '#2f6d75', letter: 'H' },
  otro:      { label: 'Otros',          color: '#6b6056', letter: '·' },
}

const ZCOLORS = ['#b5462f', '#6f7d3f', '#3f6b80', '#c08a2d', '#7a4a6b', '#2f7d6e']
const colorFor = i => ZCOLORS[i % ZCOLORS.length]

const gmapsUrl = coords => `https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`

function DetailPhoto({ wiki, name }) {
  const { url } = useWikiPhoto(wiki)
  return (
    <div className="detail-photo">
      {url ? <img src={url} alt={name} loading="lazy" /> : <div className="photo-placeholder">{name}</div>}
    </div>
  )
}

function MonumentDetail({ monument, zoneIndex, cityId, onBack }) {
  const metro = (monument.metro || '').split(',').map(s => s.trim()).filter(Boolean)
  const wiki = monument.wiki || WIKI_TITLES[cityId]?.[monument.name]
  return (
    <div className="detail show">
      <button className="detail-back" onClick={onBack}>← Volver al índice</button>
      <DetailPhoto wiki={wiki} name={monument.name} />
      <div className="detail-body">
        <div className="detail-zonetag">
          <span className="zone-swatch" style={{ background: colorFor(zoneIndex) }} />
          {monument.zone || ''}
        </div>
        <h3>{monument.name}</h3>
        {monument.kicker && <p className="kicker">{monument.kicker}</p>}
        <p className="desc">{monument.desc || ''}</p>
        <dl className="data-block">
          {monument.hours && (
            <div className="data-row"><dt>Horario</dt><dd>{monument.hours}</dd></div>
          )}
          {monument.price && (
            <div className="data-row"><dt>Precio</dt><dd>{monument.price}</dd></div>
          )}
          {metro.length > 0 && (
            <div className="data-row">
              <dt>Metro</dt>
              <dd>{metro.map(m => <span key={m} className="metro-pill">{m}</span>)}</dd>
            </div>
          )}
          {monument.tip && (
            <div className="data-row"><dt>Tip</dt><dd>{monument.tip}</dd></div>
          )}
        </dl>
        <a className="gmaps-link" target="_blank" rel="noopener noreferrer" href={gmapsUrl(monument.coords)}>
          Ver en Google Maps ↗
        </a>
      </div>
    </div>
  )
}

function SpotDetail({ spot, onBack }) {
  const t = TYPES[spot.type] || TYPES.ocio
  return (
    <div className="detail show">
      <button className="detail-back" onClick={onBack}>← Volver al índice</button>
      <DetailPhoto name={spot.name} />
      <div className="detail-body">
        <div className="detail-zonetag">
          <span className="zone-swatch" style={{ background: t.color }} />
          {t.label}{spot.zone ? ` · ${spot.zone}` : ''}
        </div>
        <h3>{spot.name}</h3>
        {spot.note ? <p className="desc">{spot.note}</p> : <p className="kicker">Lugar guardado de tu mapa.</p>}
        <a className="gmaps-link" target="_blank" rel="noopener noreferrer" href={gmapsUrl(spot.coords)}>
          Ver en Google Maps ↗
        </a>
      </div>
    </div>
  )
}

export default function CityAtlas({ city }) {
  const mapElRef = useRef(null)
  const mapRef = useRef(null)
  const zoneLayersRef = useRef({})
  const monMarkersRef = useRef({})
  const spotMarkersRef = useRef({})

  const [activeTypes, setActiveTypes] = useState(() => new Set(Object.keys(TYPES)))
  const [panelMode, setPanelMode] = useState('index') // 'index' | 'detail'
  const [activeItem, setActiveItem] = useState(null)  // { kind: 'mon'|'spot', index }
  const [activeZone, setActiveZone] = useState(null)

  function openItem(kind, index) {
    const map = mapRef.current
    if (!map) return
    const item = kind === 'mon' ? city.monuments[index] : city.spots[index]
    map.flyTo(item.coords, Math.max(city.zoom + 2, kind === 'mon' ? 15 : 16), { duration: .8 })
    setActiveItem({ kind, index })
    setPanelMode('detail')
  }

  function closeDetail() {
    const map = mapRef.current
    if (map) map.flyTo(city.center, city.zoom, { duration: .7 })
    setActiveItem(null)
    setPanelMode('index')
  }

  function focusZone(name) {
    const map = mapRef.current
    const poly = zoneLayersRef.current[name]
    if (!map || !poly) return
    map.fitBounds(poly.getBounds().pad(0.12), { animate: true })
    Object.values(zoneLayersRef.current).forEach(p => p.setStyle({ fillOpacity: .1, weight: 1.5 }))
    poly.setStyle({ fillOpacity: .26, weight: 2.5 })
    setActiveZone(name)
  }

  function toggleType(key) {
    setActiveTypes(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // Crea el mapa Leaflet y sus capas cada vez que cambia la ciudad
  useEffect(() => {
    if (!mapElRef.current) return

    const map = L.map(mapElRef.current, {
      center: city.center, zoom: city.zoom,
      zoomControl: true, scrollWheelZoom: true, attributionControl: true,
    })
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap · © CARTO', subdomains: 'abcd', maxZoom: 20,
    }).addTo(map)

    const zoneLayers = {}
    ;(city.zones || []).forEach((z, i) => {
      const col = colorFor(i)
      const poly = L.polygon(z.polygon, { color: col, weight: 1.5, opacity: .9, fillColor: col, fillOpacity: .14 }).addTo(map)
      zoneLayers[z.name] = poly
      const c = poly.getBounds().getCenter()
      L.tooltip({ permanent: true, direction: 'center', className: 'zone-tip', interactive: false })
        .setContent(z.name.toUpperCase()).setLatLng(c).addTo(map)
    })

    const monMarkers = {}
    ;(city.monuments || []).forEach((m, i) => {
      const icon = L.divIcon({
        className: '', html: `<div class="mk"><span>${i + 1}</span></div>`,
        iconSize: [30, 30], iconAnchor: [15, 28],
      })
      const mk = L.marker(m.coords, { icon, title: m.name }).addTo(map)
      mk.on('click', () => openItem('mon', i))
      monMarkers[i] = mk
    })

    const spotMarkers = {}
    ;(city.spots || []).forEach((s, i) => {
      const t = TYPES[s.type] || TYPES.ocio
      const icon = L.divIcon({
        className: '', html: `<div class="dot${s.star ? ' star' : ''}" style="--c:${t.color}">${s.star ? '★' : t.letter}</div>`,
        iconSize: s.star ? [28, 28] : [22, 22], iconAnchor: s.star ? [14, 14] : [11, 11],
      })
      const mk = L.marker(s.coords, { icon, title: s.name }).addTo(map)
      mk.on('click', () => openItem('spot', i))
      spotMarkers[i] = mk
    })

    mapRef.current = map
    zoneLayersRef.current = zoneLayers
    monMarkersRef.current = monMarkers
    spotMarkersRef.current = spotMarkers

    setActiveTypes(new Set(Object.keys(TYPES)))
    setPanelMode('index')
    setActiveItem(null)
    setActiveZone(null)

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city])

  // Resalta el marcador activo
  useEffect(() => {
    Object.entries(monMarkersRef.current).forEach(([i, mk]) => {
      const el = mk.getElement()?.querySelector('.mk')
      el?.classList.toggle('active', activeItem?.kind === 'mon' && String(activeItem.index) === i)
    })
    Object.entries(spotMarkersRef.current).forEach(([i, mk]) => {
      const el = mk.getElement()?.querySelector('.dot')
      el?.classList.toggle('active', activeItem?.kind === 'spot' && String(activeItem.index) === i)
    })
  }, [activeItem])

  // Filtro por tipo: oculta/muestra marcadores de "tus lugares"
  useEffect(() => {
    ;(city.spots || []).forEach((s, i) => {
      const el = spotMarkersRef.current[i]?.getElement()
      if (el) el.style.display = activeTypes.has(s.type) ? '' : 'none'
    })
  }, [activeTypes, city])

  const spotCounts = useMemo(() => {
    const counts = {}
    ;(city.spots || []).forEach(s => { counts[s.type] = (counts[s.type] || 0) + 1 })
    return counts
  }, [city])

  const groupedSpots = useMemo(() => (
    Object.keys(TYPES).flatMap(key =>
      (city.spots || [])
        .map((s, i) => [s, i])
        .filter(([s]) => s.type === key)
        .sort((a, b) => (b[0].star ? 1 : 0) - (a[0].star ? 1 : 0))
    )
  ), [city])

  return (
    <div className="atlas-root">
      <div className="city-header">
        <div className="id-block">
          <h2>{city.name}</h2>
          <span className="country">{city.country}</span>
        </div>
        <span className="dates">{city.dates}</span>
      </div>

      <div className="atlas">
        <div id="atlas-map" ref={mapElRef} />
        <aside className="panel">
          {panelMode === 'index' ? (
            <>
              <div className="panel-section">
                <span className="eyebrow">Cómo se divide la ciudad</span>
                <div className="zone-legend">
                  {(city.zones || []).map((z, i) => (
                    <button
                      key={z.name}
                      className={`zone-item ${activeZone === z.name ? 'active' : ''}`}
                      onClick={() => focusZone(z.name)}
                    >
                      <span className="zone-swatch" style={{ background: colorFor(i) }} />
                      <span className="zone-name">{z.name}</span>
                      <span className="zone-blurb">{z.blurb || ''}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="panel-section">
                <span className="eyebrow">Qué ver — toca para ubicarlo</span>
                <div className="mon-list">
                  {(city.monuments || []).map((m, i) => (
                    <button
                      key={m.name}
                      className={`mon-row ${activeItem?.kind === 'mon' && activeItem.index === i ? 'active' : ''}`}
                      onClick={() => openItem('mon', i)}
                    >
                      <span className="mon-num">{i + 1}</span>
                      <span>
                        <span className="mon-name">{m.name}</span>
                        <span className="mon-zone">{m.zone || ''}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {city.spots && city.spots.length > 0 && (
                <div className="panel-section spots-head">
                  <span className="eyebrow">Tus lugares guardados · {city.spots.length}</span>
                  <div className="type-chips">
                    {Object.entries(TYPES).map(([key, t]) => (
                      spotCounts[key] ? (
                        <button
                          key={key}
                          className={`type-chip ${activeTypes.has(key) ? 'active' : ''}`}
                          onClick={() => toggleType(key)}
                        >
                          <span className="type-dot" style={{ background: t.color }}>{t.letter}</span>
                          {t.label} <span className="type-count">{spotCounts[key]}</span>
                        </button>
                      ) : null
                    ))}
                  </div>
                </div>
              )}

              {city.spots && city.spots.length > 0 && (
                <div className="spot-list">
                  {groupedSpots.map(([s, i]) => {
                    const t = TYPES[s.type] || TYPES.ocio
                    const visible = activeTypes.has(s.type)
                    return (
                      <button
                        key={s.name + i}
                        className={[
                          'spot-row',
                          s.star ? 'star' : '',
                          activeItem?.kind === 'spot' && activeItem.index === i ? 'active' : '',
                          visible ? '' : 'hidden',
                        ].filter(Boolean).join(' ')}
                        onClick={() => openItem('spot', i)}
                      >
                        <span className="spot-dot" style={{ background: t.color }}>{s.star ? '★' : t.letter}</span>
                        <span className="spot-text">
                          {s.star && <span className="spot-badge">★ Vuestro alojamiento</span>}
                          <span className="spot-name">{s.name}</span>
                          {s.note && <span className="spot-note">{s.note}</span>}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          ) : activeItem?.kind === 'mon' ? (
            <MonumentDetail
              monument={city.monuments[activeItem.index]}
              zoneIndex={(city.zones || []).findIndex(z => z.name === city.monuments[activeItem.index].zone)}
              cityId={city.id}
              onBack={closeDetail}
            />
          ) : activeItem?.kind === 'spot' ? (
            <SpotDetail spot={city.spots[activeItem.index]} onBack={closeDetail} />
          ) : null}
        </aside>
      </div>
    </div>
  )
}
