'use client'
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet'
import L, { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { FeatureCollection, Feature } from 'geojson'
import { getDataGeneralFinal } from '@/components/map/api/apiMap'

// ─────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────
interface A { n: string; s: string; g: string; c: string; p: string }
interface S { n: string; cargo: string }
interface Gan { nombre: string; sigla: string; pct: number; color: string }
interface C1v { sigla: string; nombre: string; pct1v: number; color: string }
interface SV { diferencia: number; ganador2vPct: number; candidatos1v: C1v[] }
interface DatoDepto {
  nombre: string
  cands21: { sigla: string; nombre: string; color: string }[]
  gan21: Gan | null; gan15: Gan | null
  sv: SV | null
  territorio21: A[]; poblacion21: A[]; indigena21: A[]; secretarios21: S[]
  territorio15: A[]; poblacion15: A[]; indigena15: A[]
}

// ─────────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────────
function inRing(lat: number, lng: number, ring: number[][]) {
  let inside = false; const n = ring.length
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [x1, y1] = ring[i]; const [x2, y2] = ring[j]
    if ((y1 > lat) !== (y2 > lat) && lng < ((x2 - x1) * (lat - y1)) / (y2 - y1) + x1) inside = !inside
  }
  return inside
}

function detectarDepto(lat: number, lng: number, gj: FeatureCollection): Feature | null {
  return gj.features.find(f => {
    const g = f.geometry
    if (g.type === 'Polygon') return inRing(lat, lng, g.coordinates[0])
    if (g.type === 'MultiPolygon') return g.coordinates.some(p => inRing(lat, lng, p[0]))
    return false
  }) ?? null
}

function ClickHandler({ fn }: { fn: (lat: number, lng: number) => void }) {
  useMapEvents({ click: e => fn(e.latlng.lat, e.latlng.lng) })
  return null
}

function textColor(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 155 ? '#222' : '#fff'
}

// ─────────────────────────────────────────────────────────────────
// SILUETA SVG
// ─────────────────────────────────────────────────────────────────
function Silueta({ a, size = 13 }: { a: A; size?: number }) {
  const esFem = a.g === 'FEMENINO'
  const tip = `${a.n}\n${a.s}${a.p ? '\n' + a.p : ''}`
  return (
    <svg width={size} height={size * 1.9} viewBox="0 0 20 38"
      style={{ display: 'block', flexShrink: 0, cursor: 'help' }}
      aria-label={tip}>
      <title>{tip}</title>
      <circle cx="10" cy="5" r="4.5" fill={a.c} />
      {esFem ? (
        <>
          <path d="M6 11 Q10 15 14 11 L17 24 H3 Z" fill={a.c} />
          <line x1="6" y1="24" x2="4" y2="36" stroke={a.c} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="14" y1="24" x2="16" y2="36" stroke={a.c} strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <rect x="5" y="11" width="10" height="12" rx="2" fill={a.c} />
          <line x1="7" y1="23" x2="5" y2="36" stroke={a.c} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="13" y1="23" x2="15" y2="36" stroke={a.c} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────
// GRID ASAMBLEÍSTAS
// ─────────────────────────────────────────────────────────────────
function GridAsambleistas({ lista, titulo, icono }: { lista: A[]; titulo: string; icono: string }) {
  if (!lista || !lista.length) return null
  const orden: string[] = []
  const grupos: Record<string, A[]> = {}
  lista.forEach(a => {
    if (!grupos[a.s]) { grupos[a.s] = []; orden.push(a.s) }
    grupos[a.s].push(a)
  })
  const masc = lista.filter(a => a.g === 'MASCULINO').length
  const fem = lista.filter(a => a.g === 'FEMENINO').length
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingBottom: 4, borderBottom: '1.5px solid #eef' }}>
        <span style={{ fontSize: 14 }}>{icono}</span>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: '#333' }}>{titulo}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, fontSize: 10, fontWeight: 700 }}>
          <span style={{ background: '#eef3ff', borderRadius: 10, padding: '1px 7px', color: '#1565C0' }}>♂{masc}</span>
          <span style={{ background: '#fff0f6', borderRadius: 10, padding: '1px 7px', color: '#c2185b' }}>♀{fem}</span>
          <span style={{ background: '#f4f4f4', borderRadius: 10, padding: '1px 7px', color: '#555' }}>Σ{lista.length}</span>
        </div>
      </div>
      {orden.map(sigla => {
        const mb = grupos[sigla]; const col = mb[0].c
        const m = mb.filter(x => x.g === 'MASCULINO').length; const f = mb.filter(x => x.g === 'FEMENINO').length
        return (
          <div key={sigla} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: col, flexShrink: 0 }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: '#222' }}>{sigla}</span>
              <span style={{ fontSize: 10, color: '#888' }}>({m + f})</span>
              {m > 0 && <span style={{ fontSize: 10, color: '#1565C0', fontWeight: 700 }}>♂{m}</span>}
              {f > 0 && <span style={{ fontSize: 10, color: '#c2185b', fontWeight: 700 }}>♀{f}</span>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, paddingLeft: 15 }}>
              {mb.filter(x => x.g === 'MASCULINO').map((a, i) => <Silueta key={`m${i}`} a={a} size={13} />)}
              {mb.filter(x => x.g === 'FEMENINO').map((a, i) => <Silueta key={`f${i}`} a={a} size={13} />)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PanelIndigenas({ lista, ganColor }: { lista: A[]; ganColor: string }) {
  if (!lista || !lista.length) return null
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingBottom: 4, borderBottom: '1.5px solid #f0e8d8' }}>
        <span style={{ fontSize: 14 }}>🪶</span>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: '#7a5c30' }}>Asambleístas Indígenas</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, background: '#f5ede0', borderRadius: 10, padding: '1px 7px', color: '#7a5c30', fontWeight: 700 }}>{lista.length} escaños</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {lista.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'linear-gradient(135deg,#fdf8f2,#f8ede0)', borderRadius: 8, border: '1px solid #ead5b8' }}>
            <Silueta a={a} size={14} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.n}</div>
              <div style={{ fontSize: 10, color: '#9a7040', fontStyle: 'italic' }}>{a.s}</div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: a.g === 'FEMENINO' ? '#c2185b' : '#1565C0' }}>{a.g === 'FEMENINO' ? '♀' : '♂'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// PANEL DERECHO COMPLETO
// ─────────────────────────────────────────────────────────────────
function PanelDepto({ cod, anio, deptosData }: { cod: string | null; anio: '2015' | '2021', deptosData: Record<string, DatoDepto> }) {
  if (!cod) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10 }}>
      <svg width="50" height="60" viewBox="0 0 50 60">
        <path d="M25 3 L47 18 L47 55 L3 55 L3 18 Z" fill="none" stroke="#e0e0e0" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="25" cy="38" r="7" fill="#e8e8e8" />
      </svg>
      <span style={{ fontSize: 13, color: '#bbb' }}>Selecciona un departamento en el mapa</span>
    </div>
  )
  const d = deptosData[cod]
  if (!d) return <div style={{ padding: 20 }}>Datos no disponibles...</div>

  const ganador = anio === '2021' ? d.gan21 : d.gan15
  const cands = anio === '2021' ? d.cands21 : []
  const sv = anio === '2021' ? d.sv : null
  const gc = ganador?.color ?? '#888'
  const territorio = anio === '2021' ? d.territorio21 : d.territorio15
  const poblacion = anio === '2021' ? d.poblacion21 : d.poblacion15
  const indigena = anio === '2021' ? d.indigena21 : d.indigena15

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* ── Gobernador electo */}
      <div style={{ borderLeft: `5px solid ${gc}`, background: `${gc}0e`, borderRadius: '0 10px 10px 0', padding: '11px 14px', marginBottom: 16 }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#888', marginBottom: 3 }}>
          Gobernador/a electo/a {anio}{sv ? ` (2ª vuelta — ${sv.ganador2vPct.toFixed(2)}%)` : ` — ${ganador?.pct.toFixed(2)}%`}
        </div>
        <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.3, marginBottom: 6 }}>{ganador?.nombre ?? '—'}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
          <span style={{ background: gc, color: textColor(gc), fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 5 }}>{ganador?.sigla}</span>
          {sv
            ? <span style={{ fontSize: 10, background: '#fff9e6', color: '#b87800', padding: '2px 8px', borderRadius: 4, border: '1px solid #ffc107', fontWeight: 700 }}>⚡ Pasó a 2ª vuelta</span>
            : <span style={{ fontSize: 15, fontWeight: 800, color: gc }}>{ganador?.pct?.toFixed(2)}%</span>
          }
        </div>
      </div>

      {/* ── Candidatos 1ª vuelta (solo 2021) */}
      {anio === '2021' && cands && cands.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: '#555', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span>📋</span> 1ª Vuelta — {cands.length} candidatos
          </div>
          {cands.map((c, i) => {
            const esG = c.sigla === ganador?.sigla
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 9px', borderRadius: 7, marginBottom: 3, background: esG ? `${c.color}14` : '#fafafa', border: `1px solid ${esG ? c.color + '44' : '#eee'}` }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: esG ? 700 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nombre}</div>
                  <div style={{ fontSize: 10, color: '#999' }}>{c.sigla}</div>
                </div>
                {esG && !sv && <span style={{ fontSize: 12, fontWeight: 800, color: c.color, flexShrink: 0 }}>{ganador!.pct.toFixed(1)}%</span>}
                {esG && <span style={{ fontSize: 12 }}>🏆</span>}
              </div>
            )
          })}
        </div>
      )}

      {/* ── BLOQUE SEGUNDA VUELTA */}
      {sv && (
        <div style={{ marginBottom: 16, border: '2px solid #ffc107', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ background: '#fff9e6', padding: '8px 12px', borderBottom: '1px solid #ffc107', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 15 }}>📊</span>
            <span style={{ fontWeight: 800, fontSize: 11, color: '#9a6700', textTransform: 'uppercase', letterSpacing: 0.6 }}>1ª Vuelta (pasó a 2ª)</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, background: '#fff', border: '1px solid #ffc107', borderRadius: 4, padding: '2px 7px', color: '#9a6700' }}>
              Dif. 2ª vuelta: {sv.diferencia.toLocaleString()} votos
            </span>
          </div>
          <div style={{ padding: '10px 12px', background: '#fffcf0' }}>
            {sv.candidatos1v.map((c, i) => {
              const maxP = Math.max(...sv.candidatos1v.map(x => x.pct1v))
              const esMayor = c.pct1v === maxP
              return (
                <div key={i} style={{ marginBottom: i < sv.candidatos1v.length - 1 ? 10 : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 9, height: 9, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: 11, fontWeight: esMayor ? 700 : 400 }}>{c.nombre}</span>
                        <span style={{ fontSize: 10, color: '#888', marginLeft: 5 }}>{c.sigla}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: c.color }}>{c.pct1v.toFixed(2)}%</span>
                  </div>
                  <div style={{ height: 8, background: '#f0e8c0', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min((c.pct1v / 55) * 100, 100)}%`, background: c.color, borderRadius: 5, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ background: '#fff3e0', padding: '8px 12px', borderTop: '1px solid #ffc107', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13 }}>⚡</span>
            <span style={{ fontSize: 10, color: '#9a6700', fontWeight: 600 }}>2ª Vuelta — ganó</span>
            <span style={{ fontWeight: 800, fontSize: 11, color: gc }}>{ganador?.nombre}</span>
            <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 800, color: gc }}>{sv.ganador2vPct.toFixed(2)}%</span>
          </div>
        </div>
      )}

      {/* ── ASAMBLEÍSTAS */}
      <GridAsambleistas lista={territorio} titulo="Asambleístas por Territorio" icono="🗺️" />
      <GridAsambleistas lista={poblacion} titulo="Asambleístas por Población" icono="👥" />
      <PanelIndigenas lista={indigena} ganColor={gc} />

      {/* ── SECRETARIOS */}
      {anio === '2021' && d.secretarios21 && d.secretarios21.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingBottom: 4, borderBottom: '1.5px solid #eef' }}>
            <span style={{ fontSize: 14 }}>🏛️</span>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: '#333' }}>Secretarios de Despacho</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {d.secretarios21.map((s, i) => (
              <div key={i} style={{ padding: '6px 10px', borderRadius: 7, borderLeft: `4px solid ${gc}`, background: '#f8f9ff' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#333' }}>{s.cargo}</div>
                <div style={{ fontSize: 10, color: '#777', marginTop: 1 }}>{s.n}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────
export default function MapaEleccionesCompleto() {
  const CENTRO: LatLngExpression = [-16.40, -64.17]
  const mapRef = useRef<L.Map | null>(null)
  const geoJSONRef = useRef<L.GeoJSON | null>(null)

  const [geojson, setGeojson] = useState<FeatureCollection | null>(null)
  const [deptosData, setDeptosData] = useState<Record<string, DatoDepto>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [anio, setAnio] = useState<'2015' | '2021'>('2021')
  const [deptoActivo, setDeptoActivo] = useState<string | null>(null)

  useEffect(() => {
    // Aquí defines la ruta real hacia el script PHP que acabamos de crear en tu aaPanel
    const API_URL = 'https://seamovil.com/app/api/apiMap.php'

    Promise.all([
      getDataGeneralFinal('GAD'),
      fetch(API_URL).then(res => res.json())
    ])
      .then(([geoData, apiDeptos]) => {
        setGeojson(geoData as FeatureCollection)
        setDeptosData(apiDeptos)
        setIsLoading(false)
      })
      .catch(err => {
        console.error("Error cargando los datos:", err)
        setIsLoading(false)
      })
  }, [])

  useEffect(() => { setDeptoActivo(null) }, [anio])

  const getColor = useCallback((cod: string) => {
    const d = deptosData[cod]
    return (anio === '2021' ? d?.gan21?.color : d?.gan15?.color) ?? '#aaa'
  }, [anio, deptosData])

  const estiloFeature = useCallback((feature?: Feature) => {
    const cod = String(feature?.properties?.c_ut_dep ?? '')
    return { color: '#fff', weight: deptoActivo === cod ? 3 : 1, fillColor: getColor(cod), fillOpacity: deptoActivo === cod ? 0.95 : 0.78 }
  }, [getColor, deptoActivo])

  const onEachFeature = useCallback((feature: Feature, layer: L.Layer) => {
    const cod = String(feature?.properties?.c_ut_dep ?? '')
    const d = deptosData[cod]
    const g = anio === '2021' ? d?.gan21 : d?.gan15

    layer.bindTooltip(g
      ? `<b style="font-size:13px">${d?.nombre ?? cod}</b><br/><span style="color:${g.color};font-weight:700">${g.sigla}</span> — ${g.pct.toFixed(1)}%<br/><span style="font-size:11px;color:#555">${g.nombre}</span>`
      : (d?.nombre ?? cod), { sticky: true, opacity: 1 })

    layer.on({
      mouseover(e) { (e.target as L.Path).setStyle({ weight: 2.5, fillOpacity: 0.92 }); (e.target as L.Path).bringToFront() },
      mouseout(e) { const s = deptoActivo === cod; (e.target as L.Path).setStyle({ weight: s ? 3 : 1, fillOpacity: s ? 0.95 : 0.78 }) },
    })
  }, [anio, deptoActivo, deptosData])

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (!geojson) return
    const feat = detectarDepto(lat, lng, geojson)
    const cod = feat ? String(feat.properties?.c_ut_dep ?? '') : null

    if (cod && deptosData[cod]) {
      setDeptoActivo(cod)
      if (mapRef.current && geoJSONRef.current)
        geoJSONRef.current.eachLayer((l: any) => {
          if (String(l.feature?.properties?.c_ut_dep) === cod)
            mapRef.current!.flyToBounds(l.getBounds(), { duration: 0.8, padding: [35, 35] })
        })
    } else {
      setDeptoActivo(null)
      mapRef.current?.flyTo(CENTRO, 6, { duration: 0.8 })
    }
  }, [geojson, deptosData])

  const leyenda = useMemo(() => {
    const m: Record<string, string> = {}
    Object.values(deptosData).forEach(d => {
      const g = anio === '2021' ? d.gan21 : d.gan15
      if (g) m[g.sigla] = g.color
    })
    return Object.entries(m)
  }, [anio, deptosData])

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", height: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f6fb', overflow: 'hidden' }}>

      {/* HEADER */}
      <header style={{ padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#16213e', color: '#fff', flexShrink: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 6, height: 34, borderRadius: 3, background: 'linear-gradient(180deg,#e94560,#f5a623)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.4 }}>Elecciones Subnacionales — Bolivia</div>
            <div style={{ fontSize: 11, color: '#7788aa' }}>Gobernaciones · Hover sobre siluetas para ver nombre y provincia</div>
          </div>
        </div>
        <div style={{ display: 'flex', background: '#0f172a', borderRadius: 8, overflow: 'hidden', border: '1px solid #2a3550' }}>
          {(['2015', '2021'] as const).map(a => (
            <button key={a} onClick={() => setAnio(a)} style={{ padding: '7px 24px', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 14, transition: 'all 0.2s', background: anio === a ? '#e94560' : 'transparent', color: anio === a ? '#fff' : '#556080' }}>{a}</button>
          ))}
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* COLUMNA 1 — Mapa */}
        <div style={{ flex: '0 0 58%', position: 'relative', borderRight: '1px solid #dde3f0' }}>
          {isLoading
            ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa', fontSize: 14 }}>Cargando mapa y datos de la base de datos...</div>
            : geojson && (
              <MapContainer ref={mapRef} center={CENTRO} zoom={6} minZoom={5} scrollWheelZoom style={{ width: '100%', height: '100%' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" attribution="&copy; CartoDB" />
                <GeoJSON key={`${anio}-${deptoActivo ?? 'x'}`} ref={geoJSONRef} data={geojson} style={estiloFeature} onEachFeature={onEachFeature} />
                <ClickHandler fn={handleMapClick} />
              </MapContainer>
            )
          }
          <div style={{ position: 'absolute', bottom: 18, left: 14, zIndex: 1000, background: 'rgba(255,255,255,0.97)', borderRadius: 9, padding: '9px 13px', boxShadow: '0 3px 12px rgba(0,0,0,0.12)' }}>
            <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#999', marginBottom: 7 }}>Partidos: {anio}</div>
            {leyenda.map(([sigla, color]) => (
              <div key={sigla} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
                <span style={{ fontSize: 10, fontWeight: 500 }}>{sigla}</span>
              </div>
            ))}
          </div>
          {deptoActivo && deptosData[deptoActivo] && (
            <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: '#16213e', color: '#fff', padding: '5px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, boxShadow: '0 2px 10px rgba(0,0,0,0.35)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}>
              {deptosData[deptoActivo]?.nombre}
              <button onClick={() => { setDeptoActivo(null); mapRef.current?.flyTo(CENTRO, 6, { duration: 0.8 }) }} style={{ background: 'none', border: 'none', color: '#8899bb', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>✕</button>
            </div>
          )}
        </div>

        {/* COLUMNA 2 — Panel */}
        <div style={{ flex: '0 0 42%', display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden' }}>
          <div style={{ padding: '8px 16px', borderBottom: '1px solid #eef0f8', background: '#fafbff', flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#8899bb' }}>
              {deptoActivo && deptosData[deptoActivo] ? `${deptosData[deptoActivo]?.nombre} · ${anio}` : `Haz clic en un departamento · ${anio}`}
            </span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
            <PanelDepto cod={deptoActivo} anio={anio} deptosData={deptosData} />
          </div>
        </div>

      </div>
    </div>
  )
}