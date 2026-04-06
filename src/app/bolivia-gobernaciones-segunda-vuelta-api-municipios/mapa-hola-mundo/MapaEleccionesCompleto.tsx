'use client'
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet'
import L, { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { FeatureCollection, Feature } from 'geojson'
import { getDataGeneralFinal } from '@/components/map/api/apiMap'
import { Autocomplete, TextField } from '@mui/material'

/* ─────────────────────────────────────────────────────────────────
   TIPOS
───────────────────────────────────────────────────────────────── */
interface A { n: string; s: string; g: string; c: string; p: string }
interface S { n: string; cargo: string }
interface Gan { nombre: string; sigla: string; pct: number; color: string }
interface C1v { sigla: string; nombre: string; pct1v: number; color: string }
interface SV { diferencia: number; ganador2vPct: number; candidatos1v: C1v[] }
interface DatoDepto {
  nombre: string
  cands21: { sigla: string; nombre: string; color: string }[]
  gan21: Gan | null; gan15: Gan | null; sv: SV | null
  territorio21: A[]; poblacion21: A[]; indigena21: A[]; secretarios21: S[]
  subgobs21: { n: string; prov: string; s: string }[]
  corregidores21: { n: string }[]
  subgobs15: { n: string; s: string }[]
  corregidores15: { n: string }[]
  territorio15: A[]; poblacion15: A[]; indigena15: A[]
}
interface Concejal { n: string; s: string; g: string; c: string }
interface DatoMunicipio {
  id_eta: string; nombre: string; depto: string; gad: string
  alcalde21: string | null; sigla21: string | null; pct21: number | null; color21: string
  concejales21: Concejal[]
  subalcaldes21: { n: string; zona: string }[]
  secretarios21: { n: string; cargo: string }[]
  alcalde15: string | null; sigla15: string | null; pct15: number | null; color15: string
  concejales15: Concejal[]
  corregidor15: string | null
}

/* ─────────────────────────────────────────────────────────────────
   UTILIDADES
───────────────────────────────────────────────────────────────── */
function inRing(lat: number, lng: number, ring: number[][]) {
  let inside = false; const n = ring.length
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [x1, y1] = ring[i]; const [x2, y2] = ring[j]
    if ((y1 > lat) !== (y2 > lat) && lng < ((x2 - x1) * (lat - y1)) / (y2 - y1) + x1) inside = !inside
  }
  return inside
}
function puntoDentro(lat: number, lng: number, f: Feature): boolean {
  const g = f.geometry
  if (g.type === 'Polygon') return inRing(lat, lng, g.coordinates[0])
  if (g.type === 'MultiPolygon') return g.coordinates.some(p => inRing(lat, lng, p[0]))
  return false
}
function detectar(lat: number, lng: number, gj: FeatureCollection): Feature | null {
  return gj.features.find(f => puntoDentro(lat, lng, f)) ?? null
}
function ClickHandler({ fn }: { fn: (lat: number, lng: number) => void }) {
  useMapEvents({ click: e => fn(e.latlng.lat, e.latlng.lng) })
  return null
}
function textColor(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 155 ? '#222' : '#fff'
}
// id_eta 4-digit → GAD prefix (ej: '901'→'11', '909'→'19')
function etaPrefix(gad: string) { return String(parseInt(gad) - 900 + 10) }

// Nombre de departamento normalizado (sin tildes, minúsculas)
function normDepto(s: string) {
  return s.toLowerCase()
    .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
    .replace(/ó/g, 'o').replace(/ú/g, 'u').trim()
}

/* Extrae el código numérico del feature GAM.
   Prueba los campos más comunes que devuelve getDataGeneralFinal('GAM'). */
function getMunCode(f: Feature): string {
  const p = f.properties ?? {}
  // Intentar en orden de probabilidad:
  for (const k of ['codigomef', 'cod_mun', 'id_eta', 'codigo', 'municipio', 'c_ut_dep']) {
    const v = p[k]
    if (v != null && String(v).match(/^\d{4,5}$/)) return String(v)
  }
  return ''
}

/* ─────────────────────────────────────────────────────────────────
   SILUETA SVG
───────────────────────────────────────────────────────────────── */
function Silueta({ a, size = 13 }: { a: A | Concejal; size?: number }) {
  const esFem = 'g' in a ? a.g === 'FEMENINO' : false
  const tip = 'n' in a && 's' in a ? `${'n' in a ? a.n : ''}${'s' in a ? '\n' + a.s : ''}${'p' in a && (a as A).p ? '\n' + (a as A).p : ''}` : ''
  return (
    <svg width={size} height={size * 1.9} viewBox="0 0 20 38" style={{ display: 'block', flexShrink: 0, cursor: 'help' }} aria-label={tip}>
      <title>{tip}</title>
      <circle cx="10" cy="5" r="4.5" fill={a.c} />
      {esFem ? (
        <><path d="M6 11 Q10 15 14 11 L17 24 H3 Z" fill={a.c} />
          <line x1="6" y1="24" x2="4" y2="36" stroke={a.c} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="14" y1="24" x2="16" y2="36" stroke={a.c} strokeWidth="2.5" strokeLinecap="round" /></>
      ) : (
        <><rect x="5" y="11" width="10" height="12" rx="2" fill={a.c} />
          <line x1="7" y1="23" x2="5" y2="36" stroke={a.c} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="13" y1="23" x2="15" y2="36" stroke={a.c} strokeWidth="2.5" strokeLinecap="round" /></>
      )}
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────
   GRID ASAMBLEÍSTAS (panel depto)
───────────────────────────────────────────────────────────────── */
function GridAsambleistas({ lista, titulo, icono }: { lista: A[]; titulo: string; icono: string }) {
  if (!lista?.length) return null
  const orden: string[] = []; const grupos: Record<string, A[]> = {}
  lista.forEach(a => { if (!grupos[a.s]) { grupos[a.s] = []; orden.push(a.s) } grupos[a.s].push(a) })
  const masc = lista.filter(a => a.g === 'MASCULINO').length, fem = lista.filter(a => a.g === 'FEMENINO').length
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: 14 }}>{icono}</span>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(255,255,255,0.55)' }}>{titulo}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, fontSize: 10, fontWeight: 700 }}>
          <span style={{ background: 'rgba(21,101,192,0.15)', borderRadius: 10, padding: '1px 7px', color: '#64b5f6' }}>♂{masc}</span>
          <span style={{ background: 'rgba(194,24,91,0.15)', borderRadius: 10, padding: '1px 7px', color: '#f48fb1' }}>♀{fem}</span>
          <span style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '1px 7px', color: 'rgba(255,255,255,0.5)' }}>Σ{lista.length}</span>
        </div>
      </div>
      {orden.map(sigla => {
        const mb = grupos[sigla]; const col = mb[0].c
        const m = mb.filter(x => x.g === 'MASCULINO').length; const f = mb.filter(x => x.g === 'FEMENINO').length
        return (
          <div key={sigla} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: col, flexShrink: 0, boxShadow: `0 0 6px ${col}44` }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.85)' }}>{sigla}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>({m + f})</span>
              {m > 0 && <span style={{ fontSize: 10, color: '#64b5f6', fontWeight: 700 }}>♂{m}</span>}
              {f > 0 && <span style={{ fontSize: 10, color: '#f48fb1', fontWeight: 700 }}>♀{f}</span>}
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

function PanelIndigenas({ lista }: { lista: A[] }) {
  if (!lista?.length) return null
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: 14 }}>🪶</span>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(255,255,255,0.55)' }}>Asambleístas Indígenas</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, background: 'rgba(247,154,56,0.12)', borderRadius: 10, padding: '1px 7px', color: '#F79A38', fontWeight: 700 }}>{lista.length} escaños</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {lista.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
            <Silueta a={a} size={14} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.85)' }}>{a.n}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>{a.s}</div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: a.g === 'FEMENINO' ? '#f48fb1' : '#64b5f6' }}>{a.g === 'FEMENINO' ? '♀' : '♂'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   CONCEJO MUNICIPAL (panel municipio)
───────────────────────────────────────────────────────────────── */
function PanelConcejo({ concejales, anio }: { concejales: Concejal[]; anio: '2015' | '2021' }) {
  if (!concejales?.length) return (
    <div style={{ padding: '10px 0', fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>Sin datos del concejo para {anio}</div>
  )
  const orden: string[] = []; const grupos: Record<string, Concejal[]> = {}
  concejales.forEach(c => { if (!grupos[c.s]) { grupos[c.s] = []; orden.push(c.s) } grupos[c.s].push(c) })
  const masc = concejales.filter(c => c.g === 'MASCULINO').length, fem = concejales.filter(c => c.g === 'FEMENINO').length
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, paddingBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: 14 }}>🏛️</span>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(255,255,255,0.55)' }}>Concejo Municipal</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, fontSize: 10, fontWeight: 700 }}>
          <span style={{ background: 'rgba(21,101,192,0.15)', borderRadius: 10, padding: '1px 7px', color: '#64b5f6' }}>♂{masc}</span>
          <span style={{ background: 'rgba(194,24,91,0.15)', borderRadius: 10, padding: '1px 7px', color: '#f48fb1' }}>♀{fem}</span>
          <span style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '1px 7px', color: 'rgba(255,255,255,0.5)' }}>Σ{concejales.length}</span>
        </div>
      </div>
      {/* Barra proporcional */}
      <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 12, gap: 1 }}>
        {orden.map(s => (
          <div key={s} title={`${s}: ${grupos[s].length}`}
            style={{ width: `${(grupos[s].length / concejales.length) * 100}%`, background: grupos[s][0].c, flexShrink: 0 }} />
        ))}
      </div>
      {/* Grupos con siluetas */}
      {orden.map(sigla => {
        const mb = grupos[sigla]; const col = mb[0].c
        const m = mb.filter(x => x.g === 'MASCULINO').length; const f = mb.filter(x => x.g === 'FEMENINO').length
        return (
          <div key={sigla} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: col, flexShrink: 0, boxShadow: `0 0 6px ${col}44` }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.85)' }}>{sigla}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>({m + f})</span>
              {m > 0 && <span style={{ fontSize: 10, color: '#64b5f6', fontWeight: 700 }}>♂{m}</span>}
              {f > 0 && <span style={{ fontSize: 10, color: '#f48fb1', fontWeight: 700 }}>♀{f}</span>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, paddingLeft: 15 }}>
              {mb.filter(x => x.g === 'MASCULINO').map((c, i) => <Silueta key={`m${i}`} a={c} size={13} />)}
              {mb.filter(x => x.g === 'FEMENINO').map((c, i) => <Silueta key={`f${i}`} a={c} size={13} />)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   PANEL MUNICIPIO
───────────────────────────────────────────────────────────────── */
function PanelMunicipio({ mun, anio }: { mun: DatoMunicipio; anio: '2015' | '2021' }) {
  const alcalde = anio === '2021' ? mun.alcalde21 : mun.alcalde15
  const sigla = anio === '2021' ? mun.sigla21 : mun.sigla15
  const pct = anio === '2021' ? mun.pct21 : mun.pct15
  const color = anio === '2021' ? mun.color21 : mun.color15
  const concs = anio === '2021' ? mun.concejales21 : mun.concejales15
  const subs = anio === '2021' ? (mun.subalcaldes21 ?? []) : []
  const secs = anio === '2021' ? (mun.secretarios21 ?? []) : []
  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Encabezado alcalde */}
      <div style={{ borderLeft: `4px solid ${color}`, background: `${color}18`, borderRadius: '0 10px 10px 0', padding: '12px 14px', marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)', borderLeftWidth: 4, borderLeftColor: color }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.45)', marginBottom: 3 }}>
          Municipio de {mun.nombre} · Alcalde/sa {anio}
        </div>
        <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.3, marginBottom: 6, color: '#fff' }}>{alcalde ?? '— Sin datos —'}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
          {sigla && <span style={{ background: color, color: textColor(color), fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 5 }}>{sigla}</span>}
          {pct != null && <span style={{ fontSize: 15, fontWeight: 800, color: color }}>{pct.toFixed(2)}%</span>}
        </div>
      </div>

      {/* Concejo */}
      <PanelConcejo concejales={concs} anio={anio} />

      {/* Subalcaldes — solo 2021 y si existen */}
      {subs.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: 14 }}>🏘️</span>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(255,255,255,0.55)' }}>Subalcaldes</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, background: 'rgba(166,206,62,0.12)', borderRadius: 10, padding: '1px 7px', color: '#A6CE3E', fontWeight: 700 }}>{subs.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {subs.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 7, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}44` }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#A6CE3E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.zona}</div>
                  <div style={{ fontSize: 10, color: s.n === 'ACÉFALO' ? '#ef5350' : 'rgba(255,255,255,0.55)', fontStyle: s.n === 'ACÉFALO' ? 'italic' : 'normal' }}>
                    {s.n === 'ACÉFALO' ? 'Acéfalo' : s.n}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Secretarios — solo 2021 y si existen */}
      {secs.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: 14 }}>📋</span>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(255,255,255,0.55)' }}>Secretarios Municipales</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, background: 'rgba(8,176,167,0.12)', borderRadius: 10, padding: '1px 7px', color: '#08B0A7', fontWeight: 700 }}>{secs.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {secs.map((s, i) => (
              <div key={i} style={{ padding: '6px 10px', borderRadius: 7, borderLeft: `4px solid ${color}`, background: 'rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{s.cargo}</div>
                <div style={{ fontSize: 10, color: s.n === 'ACÉFALO' ? '#ef5350' : 'rgba(255,255,255,0.45)', marginTop: 1, fontStyle: s.n === 'ACÉFALO' ? 'italic' : 'normal' }}>
                  {s.n === 'ACÉFALO' ? 'Acéfalo' : s.n}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   PANEL DEPTO
───────────────────────────────────────────────────────────────── */
function PanelDepto({ cod, anio, deptosData }: { cod: string | null; anio: '2015' | '2021'; deptosData: Record<string, DatoDepto> }) {
  if (!cod) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10 }}>
      <svg width="50" height="60" viewBox="0 0 50 60">
        <path d="M25 3 L47 18 L47 55 L3 55 L3 18 Z" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="25" cy="38" r="7" fill="rgba(255,255,255,0.1)" />
      </svg>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Selecciona un departamento en el mapa</span>
    </div>
  )
  const d = deptosData[cod]; if (!d) return <div style={{ padding: 20, color: 'rgba(255,255,255,0.4)' }}>Cargando…</div>
  const ganador = anio === '2021' ? d.gan21 : d.gan15
  const cands = anio === '2021' ? d.cands21 : []
  const sv = anio === '2021' ? d.sv : null
  const gc = ganador?.color ?? '#888'
  const territorio = anio === '2021' ? d.territorio21 : d.territorio15
  const poblacion = anio === '2021' ? d.poblacion21 : d.poblacion15
  const indigena = anio === '2021' ? d.indigena21 : d.indigena15
  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Gobernador */}
      <div style={{ borderLeft: `4px solid ${gc}`, background: `${gc}18`, borderRadius: '0 10px 10px 0', padding: '12px 14px', marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)', borderLeftWidth: 4, borderLeftColor: gc }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.45)', marginBottom: 3 }}>
          Gobernador/a electo/a {anio}{sv ? ` (2ª vuelta — ${sv.ganador2vPct.toFixed(2)}%)` : ` — ${ganador?.pct.toFixed(2)}%`}
        </div>
        <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.3, marginBottom: 6, color: '#fff' }}>{ganador?.nombre ?? '—'}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
          <span style={{ background: gc, color: textColor(gc), fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 5 }}>{ganador?.sigla}</span>
          {sv
            ? <span style={{ fontSize: 10, background: 'rgba(255,193,7,0.12)', color: '#ffc107', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(255,193,7,0.3)', fontWeight: 700 }}>⚡ Pasó a 2ª vuelta</span>
            : <span style={{ fontSize: 15, fontWeight: 800, color: gc }}>{ganador?.pct?.toFixed(2)}%</span>
          }
        </div>
      </div>
      {/* Candidatos 
      {anio === '2021' && cands?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(255,255,255,0.45)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span>📋</span>1ª Vuelta — {cands.length} candidatos
          </div>
          {cands.map((c, i) => {
            const esG = c.sigla === ganador?.sigla; return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 9px', borderRadius: 7, marginBottom: 3, background: esG ? `${c.color}18` : 'rgba(255,255,255,0.04)', border: `1px solid ${esG ? c.color + '44' : 'rgba(255,255,255,0.06)'}` }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, flexShrink: 0, boxShadow: `0 0 6px ${c.color}44` }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: esG ? 700 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: esG ? '#fff' : 'rgba(255,255,255,0.7)' }}>{c.nombre}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{c.sigla}</div>
                </div>
                {esG && !sv && <span style={{ fontSize: 12, fontWeight: 800, color: c.color, flexShrink: 0 }}>{ganador!.pct.toFixed(1)}%</span>}
                {esG && <span style={{ fontSize: 12 }}>🏆</span>}
              </div>
            )
          })}
        </div>
      )}*/}
      {/* 2ª vuelta */}
      {sv && (
        <div style={{ marginBottom: 16, border: '1px solid rgba(255,193,7,0.3)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ background: 'rgba(255,193,7,0.1)', padding: '8px 12px', borderBottom: '1px solid rgba(255,193,7,0.2)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 15 }}>📊</span>
            <span style={{ fontWeight: 800, fontSize: 11, color: '#ffc107', textTransform: 'uppercase', letterSpacing: 0.6 }}>1ª Vuelta (pasó a 2ª)</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, background: 'rgba(255,193,7,0.12)', border: '1px solid rgba(255,193,7,0.3)', borderRadius: 4, padding: '2px 7px', color: '#ffc107' }}>Dif. 2ª: {sv.diferencia.toLocaleString()} votos</span>
          </div>
          <div style={{ padding: '10px 12px', background: 'rgba(255,193,7,0.04)' }}>
            {sv.candidatos1v.map((c, i) => {
              const maxP = Math.max(...sv.candidatos1v.map(x => x.pct1v))
              return (
                <div key={i} style={{ marginBottom: i < sv.candidatos1v.length - 1 ? 10 : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 9, height: 9, borderRadius: '50%', background: c.color, flexShrink: 0, boxShadow: `0 0 6px ${c.color}44` }} />
                      <div><span style={{ fontSize: 11, fontWeight: c.pct1v === maxP ? 700 : 400, color: c.pct1v === maxP ? '#fff' : 'rgba(255,255,255,0.6)' }}>{c.nombre}</span><span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginLeft: 5 }}>{c.sigla}</span></div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: c.color }}>{c.pct1v.toFixed(2)}%</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min((c.pct1v / 55) * 100, 100)}%`, background: c.color, borderRadius: 5, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ background: 'rgba(255,193,7,0.08)', padding: '8px 12px', borderTop: '1px solid rgba(255,193,7,0.2)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13 }}>⚡</span>
            <span style={{ fontSize: 10, color: '#ffc107', fontWeight: 600 }}>2ª Vuelta — ganó</span>
            <span style={{ fontWeight: 800, fontSize: 11, color: gc }}>{ganador?.nombre}</span>
            <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 800, color: gc }}>{sv.ganador2vPct.toFixed(2)}%</span>
          </div>
        </div>
      )}
      {/* Asambleístas */}
      <GridAsambleistas lista={territorio} titulo="Asambleístas por Territorio" icono="🗺️" />
      <GridAsambleistas lista={poblacion} titulo="Asambleístas por Población" icono="👥" />
      <PanelIndigenas lista={indigena} />

      {/* Subgobernadores */}
      {(() => {
        const lista = anio === '2021' ? (d.subgobs21 ?? []) : (d.subgobs15 ?? [])
        if (!lista.length) return null
        return (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 14 }}>🏛️</span>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(255,255,255,0.55)' }}>Subgobernadores</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, background: 'rgba(8,176,167,0.12)', borderRadius: 10, padding: '1px 7px', color: '#08B0A7', fontWeight: 700 }}>{lista.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {lista.map((sg, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 7, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {'prov' in sg && (sg as any).prov && <div style={{ fontSize: 10, fontWeight: 700, color: '#08B0A7', marginBottom: 1 }}>{(sg as any).prov}</div>}
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sg.n}</div>
                  </div>
                  {sg.s && sg.s !== '.' && <span style={{ fontSize: 9, background: gc, color: textColor(gc), padding: '1px 6px', borderRadius: 3, fontWeight: 700, flexShrink: 0 }}>{sg.s}</span>}
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Corregidores — solo Beni 2021 */}
      {anio === '2021' && (d.corregidores21 ?? []).length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: 14 }}>🌿</span>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(255,255,255,0.55)' }}>Corregidores</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, background: 'rgba(166,206,62,0.12)', borderRadius: 10, padding: '1px 7px', color: '#A6CE3E', fontWeight: 700 }}>{d.corregidores21.length}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            {d.corregidores21.map((c, i) => (
              <div key={i} style={{ padding: '5px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)', fontSize: 10, color: 'rgba(255,255,255,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.n}>
                {c.n}
              </div>
            ))}
          </div>
        </div>
      )}

      {anio === '2021' && d.secretarios21?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: 14 }}>📋</span>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(255,255,255,0.55)' }}>Secretarios de Despacho</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {d.secretarios21.map((s, i) => (
              <div key={i} style={{ padding: '6px 10px', borderRadius: 7, borderLeft: `4px solid ${gc}`, background: 'rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{s.cargo}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>{s.n}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────────────────────────────── */
const API_BASE = 'https://seamovil.com/app/api/apiMap.php'

export default function MapaEleccionesCompleto() {
  const CENTRO: LatLngExpression = [-16.40, -64.17]
  const mapRef = useRef<L.Map | null>(null)
  const geoDepRef = useRef<L.GeoJSON | null>(null)
  const geoMunRef = useRef<L.GeoJSON | null>(null)

  const [geoDep, setGeoDep] = useState<FeatureCollection | null>(null)
  const [geoMun, setGeoMun] = useState<FeatureCollection | null>(null)
  const [deptosData, setDeptosData] = useState<Record<string, DatoDepto>>({})
  const [munsAll, setMunsAll] = useState<Record<string, DatoMunicipio>>({})
  const [anio, setAnio] = useState<'2015' | '2021'>('2021')
  const [deptoActivo, setDeptoActivo] = useState<string | null>(null)
  const [munActiva, setMunActiva] = useState<string | null>(null) // id_eta
  const [vista, setVista] = useState<'depto' | 'municipio'>('depto')
  const [loadDep, setLoadDep] = useState(true)
  const [loadMun, setLoadMun] = useState(true)

  // Carga inicial en paralelo
  useEffect(() => {
    Promise.all([getDataGeneralFinal('GAD'), fetch(API_BASE).then(r => r.json())])
      .then(([gd, deptos]) => { setGeoDep(gd as FeatureCollection); setDeptosData(deptos); setLoadDep(false) })
      .catch(() => setLoadDep(false))

    Promise.all([getDataGeneralFinal('GAM'), fetch(`${API_BASE}?nivel=municipios`).then(r => r.json())])
      .then(([gm, munis]) => {
        setGeoMun(gm as FeatureCollection)
        const byEta: Record<string, DatoMunicipio> = {}
        if (Array.isArray(munis)) munis.forEach((m: DatoMunicipio) => { byEta[m.id_eta] = m })
        else Object.assign(byEta, munis)
        setMunsAll(byEta)
        setLoadMun(false)
      })
      .catch(() => setLoadMun(false))
  }, [])

  useEffect(() => { setMunActiva(null); setVista('depto') }, [anio])
  useEffect(() => { setMunActiva(null); setVista('depto') }, [deptoActivo])

  // Mapa nombre normalizado → id_eta (para fallback por nombre)
  const munByNombre = useMemo(() => {
    const m: Record<string, string> = {}
    Object.values(munsAll).forEach(mu => { m[normDepto(mu.nombre)] = mu.id_eta })
    return m
  }, [munsAll])

  // Opciones de búsqueda para el Autocomplete
  const searchOptions = useMemo(() => {
    const opts: { label: string; group: string; type: 'depto' | 'municipio'; cod: string; gad?: string }[] = []
    Object.entries(deptosData).forEach(([cod, d]) => {
      opts.push({ label: d.nombre, group: 'Departamentos', type: 'depto', cod })
    })
    Object.entries(munsAll).forEach(([eta, m]) => {
      const depNom = deptosData[m.gad]?.nombre ?? ''
      opts.push({ label: `${m.nombre} (${depNom})`, group: `Municipios — ${depNom}`, type: 'municipio', cod: eta, gad: m.gad })
    })
    return opts
  }, [deptosData, munsAll])

  // Filtrar municipios del depto activo — 3 estrategias en cascada
  const geoMunFilt = useMemo((): FeatureCollection | null => {
    if (!geoMun || !deptoActivo) return null

    const pref = etaPrefix(deptoActivo)           // '11'..'19'
    const depNomNorm = normDepto(deptosData[deptoActivo]?.nombre ?? '')

    const features = geoMun.features.filter(f => {
      const p = f.properties ?? {}

      // ── Estrategia 1: código numérico coincide con prefijo del depto
      const c = getMunCode(f)
      if (c.length === 4 && c.startsWith(pref)) return true
      if (c && munsAll[c]?.gad === deptoActivo) return true

      // ── Estrategia 2: campo de nombre de depto en el GeoJSON
      for (const k of ['nom_dpto', 'depto', 'departamento', 'DEPARTAMENTO', 'NOM_DEP']) {
        const v = String(p[k] ?? '')
        if (v && normDepto(v) === depNomNorm) return true
      }

      // ── Estrategia 3: nombre del municipio existe en munsAll para este depto
      for (const k of ['municipio', 'nom_eta', 'nombreeta', 'MUNICIPIO', 'NOM_MUN']) {
        const v = String(p[k] ?? '').trim()
        if (v) {
          const eta = munByNombre[normDepto(v)]
          if (eta && munsAll[eta]?.gad === deptoActivo) return true
        }
      }
      return false
    })

    // ── LOG DE DIAGNÓSTICO (visible en la consola del navegador)
    console.log(
      `[GAM] depto=${deptoActivo} (${deptosData[deptoActivo]?.nombre})`,
      `| features totales: ${geoMun.features.length}`,
      `| features filtradas: ${features.length}`,
    )
    if (geoMun.features.length > 0)
      console.log('[GAM props de la 1ª feature]:', geoMun.features[0].properties)

    return features.length ? { type: 'FeatureCollection', features } : null
  }, [geoMun, deptoActivo, munsAll, munByNombre, deptosData])

  // Colores
  const getColorDep = useCallback((cod: string) => {
    const d = deptosData[cod]
    return (anio === '2021' ? d?.gan21?.color : d?.gan15?.color) ?? '#aaa'
  }, [anio, deptosData])

  const getColorMun = useCallback((cod: string) => {
    const m = munsAll[cod]
    return (anio === '2021' ? m?.color21 : m?.color15) ?? '#cccccc'
  }, [anio, munsAll])

  // Resuelve id_eta a partir de un feature GAM (código o nombre)
  // ⚠️ Debe ir ANTES de estiloMun, onEachMun y handleMapClick
  const resolverCodMun = useCallback((f: Feature): string | null => {
    const c = getMunCode(f)
    if (c && munsAll[c]) return c
    const p = f.properties ?? {}
    for (const k of ['municipio', 'nom_eta', 'nombreeta', 'MUNICIPIO', 'NOM_MUN', 'nombre']) {
      const v = String(p[k] ?? '').trim()
      if (v) { const eta = munByNombre[normDepto(v)]; if (eta && munsAll[eta]) return eta }
    }
    return null
  }, [munsAll, munByNombre])

  // Estilos GeoJSON
  const estiloDep = useCallback((f?: Feature) => {
    const cod = String(f?.properties?.c_ut_dep ?? '')
    const act = deptoActivo === cod
    return {
      color: '#fff', weight: act ? 3 : 1, fillColor: getColorDep(cod),
      fillOpacity: deptoActivo ? (act ? 0.15 : 0.25) : 0.78
    }
  }, [getColorDep, deptoActivo])

  const estiloMun = useCallback((f?: Feature) => {
    const cod = f ? resolverCodMun(f) ?? getMunCode(f) : ''
    const isActiva = munActiva === cod
    return {
      color: '#fff', weight: isActiva ? 2.5 : 0.6,
      fillColor: getColorMun(cod), fillOpacity: isActiva ? 0.95 : 0.82,
      className: isActiva ? 'mun-blink' : ''
    }
  }, [getColorMun, munActiva, resolverCodMun])

  // onEachFeature
  const onEachDep = useCallback((f: Feature, layer: L.Layer) => {
    const cod = String(f?.properties?.c_ut_dep ?? '')
    const d = deptosData[cod]; const g = anio === '2021' ? d?.gan21 : d?.gan15
    layer.bindTooltip(g
      ? `<b style="font-size:13px">${d?.nombre ?? cod}</b><br/><span style="color:${g.color};font-weight:700">${g.sigla}</span> — ${g.pct.toFixed(1)}%<br/><span style="font-size:11px;color:#555">${g.nombre}</span>`
      : (d?.nombre ?? cod), { sticky: true, opacity: 1 })
    layer.on({
      mouseover(e) { (e.target as L.Path).setStyle({ weight: 2.5, fillOpacity: 0.6 }); (e.target as L.Path).bringToFront() },
      mouseout(e) { const s = deptoActivo === cod; (e.target as L.Path).setStyle({ weight: s ? 3 : 1, fillOpacity: deptoActivo ? (s ? 0.15 : 0.25) : 0.78 }) },
    })
  }, [anio, deptoActivo, deptosData])

  const onEachMun = useCallback((f: Feature, layer: L.Layer) => {
    const cod = resolverCodMun(f) ?? getMunCode(f)
    const m = munsAll[cod]
    const alc = anio === '2021' ? m?.alcalde21 : m?.alcalde15
    const sig = anio === '2021' ? m?.sigla21 : m?.sigla15
    const pct = anio === '2021' ? m?.pct21 : m?.pct15
    const col = anio === '2021' ? m?.color21 : m?.color15
    const nom = m?.nombre ?? String(f.properties?.municipio ?? f.properties?.nom_eta ?? cod)
    layer.bindTooltip(alc
      ? `<b style="font-size:12px">${nom}</b><br/><span style="color:${col};font-weight:700">${sig}</span> — ${pct?.toFixed(1)}%<br/><span style="font-size:11px;color:#555">${alc}</span>`
      : nom, { sticky: true, opacity: 1 })
    layer.on({
      mouseover(e) { (e.target as L.Path).setStyle({ weight: 2, fillOpacity: 0.98 }); (e.target as L.Path).bringToFront() },
      mouseout(e) { const s = munActiva === cod; (e.target as L.Path).setStyle({ weight: s ? 2.5 : 0.6, fillOpacity: s ? 0.95 : 0.82 }) },
    })
  }, [anio, munActiva, munsAll, resolverCodMun])

  // Auto-zoom al municipio activo cuando se carga su GeoJSON (especialmente útil para el buscador)
  useEffect(() => {
    if (munActiva && mapRef.current && geoMunRef.current) {
      const tryZoom = () => {
        let zoomed = false
        if (geoMunRef.current && mapRef.current) {
          geoMunRef.current.eachLayer((l: any) => {
            const cod = resolverCodMun(l.feature) ?? getMunCode(l.feature)
            if (cod === munActiva) {
              mapRef.current!.flyToBounds(l.getBounds(), { duration: 0.7, padding: [25, 25] })
              zoomed = true
            }
          })
        }
        return zoomed
      }

      // Intentar zoom inmediato, si las capas no se generaron del todo, dar un fallback con pequeño delay
      if (!tryZoom()) {
        const t = setTimeout(tryZoom, 150)
        return () => clearTimeout(t)
      }
    }
  }, [munActiva, geoMunFilt, resolverCodMun])

  // Clicks
  const handleMapClick = useCallback((lat: number, lng: number) => {
    // 1) Intentar clic en municipio (solo si hay depto activo)
    if (deptoActivo && geoMunFilt) {
      const fMun = detectar(lat, lng, geoMunFilt)
      const codMun = fMun ? resolverCodMun(fMun) : null
      if (codMun && munsAll[codMun]) {
        setMunActiva(codMun); setVista('municipio')
        // El zoom lo hace el useEffect superior automáticamente
        return
      }
    }
    // 2) Clic en depto
    if (geoDep) {
      const fDep = detectar(lat, lng, geoDep)
      const codDep = fDep ? String(fDep.properties?.c_ut_dep ?? '') : null
      if (codDep && deptosData[codDep]) {
        setDeptoActivo(codDep); setMunActiva(null); setVista('depto')
        if (mapRef.current && geoDepRef.current)
          geoDepRef.current.eachLayer((l: any) => {
            if (String(l.feature?.properties?.c_ut_dep) === codDep)
              mapRef.current!.flyToBounds(l.getBounds(), { duration: 0.8, padding: [35, 35] })
          })
      } else {
        setDeptoActivo(null); setMunActiva(null); setVista('depto')
        mapRef.current?.flyTo(CENTRO, 6, { duration: 0.8 })
      }
    }
  }, [geoDep, geoMunFilt, deptoActivo, deptosData, munsAll, resolverCodMun])

  // Leyenda dinámica
  const leyenda = useMemo(() => {
    if (deptoActivo) {
      const m: Record<string, string> = {}
      Object.values(munsAll).filter(mu => mu.gad === deptoActivo).forEach(mu => {
        const s = anio === '2021' ? mu.sigla21 : mu.sigla15
        const c = anio === '2021' ? mu.color21 : mu.color15
        if (s) m[s] = c
      })
      return { tipo: 'Alcaldes', entries: Object.entries(m) }
    }
    const m: Record<string, string> = {}
    Object.values(deptosData).forEach(d => {
      const g = anio === '2021' ? d.gan21 : d.gan15
      if (g) m[g.sigla] = g.color
    })
    return { tipo: 'Gobernadores', entries: Object.entries(m) }
  }, [anio, deptoActivo, deptosData, munsAll])

  const munData = munActiva ? munsAll[munActiva] : null
  const isLoading = loadDep

  /* Handler de búsqueda */
  const handleSearchSelect = useCallback((_: any, opt: { type: 'depto' | 'municipio'; cod: string; gad?: string } | null) => {
    if (!opt) return
    if (opt.type === 'depto') {
      setDeptoActivo(opt.cod); setMunActiva(null); setVista('depto')
      if (mapRef.current && geoDepRef.current)
        geoDepRef.current.eachLayer((l: any) => {
          if (String(l.feature?.properties?.c_ut_dep) === opt.cod)
            mapRef.current!.flyToBounds(l.getBounds(), { duration: 0.8, padding: [35, 35] })
        })
    } else {
      setDeptoActivo(opt.gad ?? null); setMunActiva(opt.cod); setVista('municipio')
      // El zoom dinámico hacia el municipio (y carga de capas) lo manejará el nuevo useEffect superior
    }
  }, [geoDepRef, mapRef])

  return (
    <div style={{ fontFamily: "'sinkin_sans200_x_light',system-ui,sans-serif", height: '100vh', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.55)', overflow: 'hidden' }}>

      {/* HEADER */}
      <header style={{ padding: '0 20px', height: 'auto', minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8, 176, 167, 0.08)', backdropFilter: 'blur(12px)', color: '#fff', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 2px 16px rgba(0,0,0,0.2)', flexWrap: 'wrap', gap: 10, paddingTop: 8, paddingBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 5, height: 34, borderRadius: 3, background: 'linear-gradient(180deg, #08B0A7, #A6CE3E)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.3 }}>Elecciones Subnacionales — Bolivia</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
              {deptoActivo && deptosData[deptoActivo]
                ? `${deptosData[deptoActivo].nombre} · Haz clic en un municipio para ver alcalde y concejo`
                : 'Gobernaciones · Haz clic en un departamento para ver municipios'}
            </div>
          </div>
        </div>

        {/* Buscador */}
        <div style={{ flex: '1 1 280px', maxWidth: 400, minWidth: 200 }}>
          <Autocomplete
            size="small"
            options={searchOptions}
            groupBy={(opt) => opt.group}
            getOptionLabel={(opt) => opt.label}
            onChange={handleSearchSelect}
            renderInput={(params) => (
              <TextField {...params} placeholder="Buscar departamento o municipio…" variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    fontFamily: 'sinkin_sans200_x_light',
                    fontSize: 13,
                    background: 'rgba(0,0,0,0.25)',
                    borderRadius: '8px',
                    height: 36,
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&:hover fieldset': { borderColor: '#08B0A7' },
                    '&.Mui-focused fieldset': { borderColor: '#08B0A7' },
                  },
                  '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.4)', opacity: 1 },
                  '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.4)' },
                }}
              />
            )}
            slotProps={{
              paper: {
                sx: {
                  background: 'rgba(20,30,50,0.97)',
                  backdropFilter: 'blur(12px)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontFamily: 'sinkin_sans200_x_light',
                  '& .MuiAutocomplete-groupLabel': { color: '#08B0A7', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8 },
                  '& .MuiAutocomplete-option': { fontSize: 12, '&:hover': { background: 'rgba(8,176,167,0.15)' }, '&[aria-selected=true]': { background: 'rgba(8,176,167,0.25) !important' } },
                }
              }
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/*FDF 
          {deptoActivo && (
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)' }}>
              <button onClick={() => { setVista('depto'); setMunActiva(null) }}
                style={{ padding: '5px 14px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 11, fontFamily: 'inherit', background: vista === 'depto' ? '#08B0A7' : 'transparent', color: vista === 'depto' ? '#fff' : 'rgba(255,255,255,0.45)', transition: 'all 0.2s', borderRadius: vista === 'depto' ? 6 : 0 }}>
                🏛️ Gobernación
              </button>
              <button onClick={() => munData && setVista('municipio')} disabled={!munData}
                style={{ padding: '5px 14px', border: 'none', cursor: munData ? 'pointer' : 'default', fontWeight: 700, fontSize: 11, fontFamily: 'inherit', background: vista === 'municipio' ? '#A6CE3E' : 'transparent', color: vista === 'municipio' ? '#1a2a1a' : munData ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.15)', transition: 'all 0.2s', borderRadius: vista === 'municipio' ? 6 : 0 }}>
                🏘️ {munData ? munData.nombre : 'Municipio'}
              </button>
            </div>
          )}*/}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)' }}>
            {(['2015', '2021'] as const).map(a => (
              <button key={a} onClick={() => setAnio(a)} style={{ padding: '6px 20px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit', transition: 'all 0.25s', background: anio === a ? '#F79A38' : 'transparent', color: anio === a ? '#fff' : 'rgba(255,255,255,0.4)', borderRadius: anio === a ? 6 : 0 }}>{a}</button>
            ))}
          </div>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* MAPA */}
        <div style={{ flex: '0 0 58%', position: 'relative', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
          {isLoading
            ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#08B0A7', fontSize: 14, gap: 10 }}>
              <div style={{ width: 24, height: 24, border: '3px solid rgba(8,176,167,0.2)', borderTop: '3px solid #08B0A7', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Cargando mapa y datos…
            </div>
            : geoDep && (
              <MapContainer ref={mapRef} center={CENTRO} zoom={6} minZoom={5} scrollWheelZoom style={{ width: '100%', height: '100%' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png" attribution="&copy; CartoDB" />
                <GeoJSON key={`dep-${anio}-${deptoActivo ?? 'x'}`} ref={geoDepRef} data={geoDep} style={estiloDep} onEachFeature={onEachDep} />
                {deptoActivo && geoMunFilt && geoMunFilt.features.length > 0 && (
                  <GeoJSON key={`mun-${anio}-${deptoActivo}-${munActiva ?? 'x'}`} ref={geoMunRef} data={geoMunFilt} style={estiloMun} onEachFeature={onEachMun} />
                )}
                <ClickHandler fn={handleMapClick} />
              </MapContainer>
            )
          }
          {/* Leyenda */}
          <div style={{ position: 'absolute', bottom: 18, left: 14, zIndex: 1000, background: 'rgba(10,20,40,0.88)', backdropFilter: 'blur(10px)', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '50vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#08B0A7', marginBottom: 8 }}>{leyenda.tipo} {anio}</div>
            {leyenda.entries.map(([sigla, color]) => (
              <div key={sigla} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: color, boxShadow: `0 0 6px ${color}44` }} />
                <span style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>{sigla}</span>
              </div>
            ))}
          </div>
          {/* Badge activo */}
          {(deptoActivo || munActiva) && (
            <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'rgba(8,176,167,0.9)', backdropFilter: 'blur(8px)', color: '#fff', padding: '6px 18px', borderRadius: 20, fontSize: 12, fontWeight: 700, boxShadow: '0 4px 16px rgba(8,176,167,0.35)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(255,255,255,0.2)' }}>
              {munActiva && munData ? `🏘️ ${munData.nombre}` : deptoActivo && deptosData[deptoActivo] ? `🏛️ ${deptosData[deptoActivo].nombre}` : ''}
              <button onClick={() => {
                if (munActiva) {
                  setMunActiva(null); setVista('depto')
                  if (mapRef.current && geoDepRef.current)
                    geoDepRef.current.eachLayer((l: any) => {
                      if (String(l.feature?.properties?.c_ut_dep) === deptoActivo)
                        mapRef.current!.flyToBounds(l.getBounds(), { duration: 0.6, padding: [35, 35] })
                    })
                } else {
                  setDeptoActivo(null); setMunActiva(null); setVista('depto')
                  mapRef.current?.flyTo(CENTRO, 6, { duration: 0.8 })
                }
              }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>✕</button>
            </div>
          )}
        </div>

        {/* PANEL */}
        <div style={{ flex: '0 0 42%', display: 'flex', flexDirection: 'column', background: 'rgba(30,35,50,0.92)', backdropFilter: 'blur(16px)', overflow: 'hidden' }}>
          {/* Breadcrumb */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {deptoActivo && deptosData[deptoActivo] ? (
              <button onClick={() => { setVista('depto'); setMunActiva(null) }}
                style={{ fontSize: 11, fontWeight: 700, color: vista === 'depto' ? '#08B0A7' : 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', transition: 'color 0.2s' }}>
                🏛️ {deptosData[deptoActivo].nombre}
              </button>
            ) : (
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>Haz clic en un departamento · {anio}</span>
            )}
            {munData && (
              <><span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>›</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#A6CE3E' }}>🏘️ {munData.nombre}</span></>
            )}
            <span style={{ marginLeft: 'auto', fontSize: 10, color: '#08B0A7', fontWeight: 700, background: 'rgba(8,176,167,0.12)', padding: '2px 8px', borderRadius: 4 }}>{anio}</span>
          </div>
          <div className="dark-panel-scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', color: 'rgba(255,255,255,0.88)' }}>
            {vista === 'municipio' && munData
              ? <PanelMunicipio mun={munData} anio={anio} />
              : <PanelDepto cod={deptoActivo} anio={anio} deptosData={deptosData} />
            }
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes mun-blink-anim {
          0%, 100% { fill-opacity: 0.95; stroke-width: 2.5px; }
          50% { fill-opacity: 0.55; stroke-width: 2.5px; stroke-opacity: 0.6; }
        }
        .mun-blink {
          animation: mun-blink-anim 0.7s ease-in-out 4;
        }
        .dark-panel-scroll::-webkit-scrollbar { width: 6px; }
        .dark-panel-scroll::-webkit-scrollbar-track { background: transparent; }
        .dark-panel-scroll::-webkit-scrollbar-thumb { background: rgba(8,176,167,0.35); border-radius: 3px; }
        .dark-panel-scroll::-webkit-scrollbar-thumb:hover { background: rgba(8,176,167,0.55); }
      `}</style>
    </div>
  )
}