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
  directores21?: S[]
  subgobs21: { n: string; prov: string; s: string }[]
  corregidores21: { n: string; s: string; c: string }[]
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

/** Determina si un color hex es claro (luminancia > 160) */
function isLight(hex: string): boolean {
  const c = hex.replace('#', '')
  if (c.length < 6) return true
  const r = parseInt(c.substr(0, 2), 16)
  const g = parseInt(c.substr(2, 2), 16)
  const b = parseInt(c.substr(4, 2), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 160
}

/**
 * Si el tema es oscuro y el color del partido es demasiado oscuro para leerse,
 * lo aclara (mezcla hacia blanco) preservando el matiz. Si el tema es claro,
 * devuelve el color original sin cambios.
 */
function ensureReadableColor(hex: string, dark: boolean): string {
  if (!dark) return hex                     // En modo claro no toca nada
  if (!hex || hex.length < 7) return hex
  if (isLight(hex)) return hex              // Ya es suficientemente claro
  // Mezclar con blanco un 55 % para aclarar sin perder el matiz
  const c = hex.replace('#', '')
  const r = parseInt(c.substr(0, 2), 16)
  const g = parseInt(c.substr(2, 2), 16)
  const b = parseInt(c.substr(4, 2), 16)
  const mix = (ch: number) => Math.min(255, Math.round(ch + (255 - ch) * 0.55))
  return `#${mix(r).toString(16).padStart(2, '0')}${mix(g).toString(16).padStart(2, '0')}${mix(b).toString(16).padStart(2, '0')}`
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
   SILUETAS SVG (basadas en varon.svg y mujer.svg subidos)
───────────────────────────────────────────────────────────────── */
function SiluetaVaron({ color, size = 22, tooltip }: { color: string; size?: number; tooltip?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 -36 36 36" style={{ display: 'block', flexShrink: 0, cursor: 'help', overflow: 'visible' }} aria-label={tooltip}>
      {tooltip && <title>{tooltip}</title>}
      <g transform="scale(1 -1)">
        <g stroke="none" strokeWidth="0.615">
          <path d="M 17.999,28.576 C 20.05,28.576 21.712,30.238 21.712,32.288 C 21.712,34.338 20.05,36 17.999,36 C 15.95,36 14.287,34.338 14.287,32.288 C 14.287,30.238 15.95,28.576 17.999,28.576 Z" fill={color} />
          <path d="M 23.568,27.712 L 12.432,27.712 C 11.602,27.712 10.928,27.038 10.928,26.208 L 10.928,11.36 C 10.928,10.53 11.602,9.856 12.432,9.856 C 13.262,9.856 13.935,10.53 13.935,11.36 L 13.935,23.744 C 13.935,23.938 14.095,24.096 14.287,24.096 C 14.482,24.096 14.64,23.938 14.64,23.744 L 14.64,16.352 L 14.64,8.704 L 14.64,1.504 C 14.64,0.673 15.314,0 16.143,0 C 16.975,0 17.648,0.673 17.648,1.504 L 17.648,7.512 L 17.648,15.593 C 17.648,15.781 17.803,15.936 17.992,15.936 L 18.008,15.936 C 18.198,15.936 18.351,15.781 18.351,15.593 L 18.351,7.512 L 18.351,1.504 C 18.351,0.673 19.025,0 19.856,0 C 20.687,0 21.36,0.673 21.36,1.504 L 21.36,8.704 L 21.36,16.352 L 21.36,23.744 C 21.36,23.938 21.518,24.096 21.712,24.096 C 21.906,24.096 22.064,23.938 22.064,23.744 L 22.064,11.36 C 22.064,10.53 22.737,9.856 23.568,9.856 C 24.399,9.856 25.072,10.53 25.072,11.36 L 25.072,26.208 C 25.072,27.038 24.399,27.712 23.568,27.712 Z" fill={color} />
        </g>
      </g>
    </svg>
  )
}

function SiluetaMujer({ color, size = 22, tooltip }: { color: string; size?: number; tooltip?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 -36 36 36" style={{ display: 'block', flexShrink: 0, cursor: 'help', overflow: 'visible' }} aria-label={tooltip}>
      {tooltip && <title>{tooltip}</title>}
      <g transform="scale(1 -1)">
        <g stroke="none" strokeWidth="0.615">
          <path d="M 18.018,28.576 C 20.068,28.576 21.73,30.237 21.73,32.288 C 21.73,34.337 20.068,36 18.018,36 C 15.967,36 14.305,34.337 14.305,32.288 C 14.305,30.237 15.967,28.576 18.018,28.576 Z" fill={color} />
          <path d="M 21.374,22.784 C 21.514,22.784 21.635,22.687 21.666,22.55 L 24.143,11.399 C 24.323,10.588 25.126,10.076 25.938,10.256 C 26.748,10.437 27.259,11.24 27.079,12.051 L 23.859,26.546 C 23.706,27.235 23.098,27.679 22.421,27.695 L 22.421,27.711 L 20.918,27.711 L 15.084,27.711 L 13.614,27.711 L 13.614,27.694 C 12.924,27.695 12.298,27.247 12.141,26.546 L 8.921,12.051 C 8.738,11.225 9.272,10.407 10.109,10.247 C 10.918,10.093 11.693,10.657 11.872,11.46 L 14.335,22.55 C 14.366,22.687 14.487,22.784 14.626,22.784 L 14.626,22.784 C 14.818,22.784 14.96,22.607 14.918,22.42 L 11.999,9.278 L 14.657,9.278 L 14.657,1.567 C 14.657,0.743 15.292,0.026 16.115,0.001 C 16.967,-0.025 17.666,0.658 17.666,1.504 L 17.666,7.511 L 17.666,9.278 L 18.37,9.278 L 18.37,7.511 L 18.37,1.504 C 18.37,0.673 19.042,0 19.874,0 L 19.874,0 C 20.704,0 21.378,0.673 21.378,1.504 L 21.378,9.278 L 24.001,9.278 L 21.082,22.42 C 21.041,22.607 21.183,22.784 21.374,22.784 L 21.374,22.784 Z" fill={color} />
        </g>
      </g>
    </svg>
  )
}

/** Wrapper que elige varón/mujer según género */
function SiluetaPersona({ a, size = 22, municipio }: { a: A | Concejal; size?: number; municipio?: string }) {
  const esFem = 'g' in a ? a.g === 'FEMENINO' : false
  const partes = [a.n, a.s]
  if ('p' in a && (a as A).p) partes.push((a as A).p)
  if (municipio) partes.push(municipio)
  const tip = partes.filter(Boolean).join(' · ')
  return esFem
    ? <SiluetaMujer color={a.c} size={size} tooltip={tip} />
    : <SiluetaVaron color={a.c} size={size} tooltip={tip} />
}

/** Infiere género a partir del primer nombre (heurística para nombres en español/bolivianos) */
function inferGenero(nombre: string): 'M' | 'F' {
  const parts = nombre.trim().toUpperCase().split(/\s+/)
  const first = parts[0] || ''
  // Nombres femeninos comunes que NO terminan en A
  const femSinA = new Set([
    'CARMEN','DOLORES','MERCEDES','PILAR','ROSARIO','SOLEDAD','BEATRIZ','RAQUEL',
    'INES','INÉS','ISABEL','MARIBEL','JUDITH','RUTH','ELIZABETH','ESTHER','ESTER',
    'EDITH','INGRID','GLADYS','MARGOT','MIRIAM','LUZ','FLOR','LOURDES','LIZBETH',
    'NAYELI','NOEMI','NOEMÍ','ROCIO','ROCÍO','MARISOL','NATALY','NATHALY','YENNY',
    'JENNY','WENDY','SHIRLEY','EVELYN','MABEL','MAGALY','MARGELY','NELLY','DENIS',
    'DENISSE','ROSSEMARY','ROSMERY','JHOSELIN','JOCELYN','JACQUELIN','JACQUELINE',
    'VIVIAN','ABIGAIL','JHENNY','MARIEL','YOSEF','SUSY','NANCY','KELLY','KIMBERLY',
    'LIDIA','MARILUZ','MARICRUZ','MARICEL','MARITZEL','MARLEN','MARLENE','MARLENI',
  ])
  // Nombres masculinos que terminan en A
  const mascConA = new Set([
    'JOSEBA','BORJA','JOSHUA','NIKOLA','LUCA','GARCIA','EZRA','MUSTAFA','VIERA',
  ])
  if (femSinA.has(first)) return 'F'
  if (mascConA.has(first)) return 'M'
  if (first.endsWith('A') || first.endsWith('Á')) return 'F'
  return 'M'
}

/** Silueta que elige varón/mujer automáticamente a partir del nombre */
function SiluetaAuto({ nombre, color, size = 22, tooltip }: { nombre: string; color: string; size?: number; tooltip?: string }) {
  return inferGenero(nombre) === 'F'
    ? <SiluetaMujer color={color} size={size} tooltip={tooltip} />
    : <SiluetaVaron color={color} size={size} tooltip={tooltip} />
}

/* ─────────────────────────────────────────────────────────────────
   GRID ASAMBLEÍSTAS (panel depto)
───────────────────────────────────────────────────────────────── */
function GridAsambleistas({ lista, titulo, isDark }: { lista: A[]; titulo: string; isDark: boolean }) {
  if (!lista?.length) return null
  const orden: string[] = []; const grupos: Record<string, A[]> = {}
  lista.forEach(a => { if (!grupos[a.s]) { grupos[a.s] = []; orden.push(a.s) } grupos[a.s].push(a) })
  const total = lista.length

  return (
    <div className="mt-4">
      <div className="text-center mb-3">
        <span className={`fw-bold text-uppercase ${isDark ? 'text-white-50' : 'text-secondary'}`} style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
          {titulo} [TOTAL = {total}]
        </span>
      </div>

      <div className="d-flex flex-column gap-0">
        {orden.map((s, idx) => {
          const miembros = grupos[s];
          const col = miembros[0].c;
          return (
            <div key={s} className="d-flex align-items-center justify-content-between py-3" style={{ borderBottom: idx < orden.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` : 'none', borderLeft: `4px solid ${col}`, paddingLeft: '12px' }}>
              <div className="d-flex align-items-center flex-grow-1 gap-3">
                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  <div className={`rounded-circle d-flex align-items-center justify-content-center ${isDark ? 'bg-secondary bg-opacity-25' : 'bg-light border'}`} style={{ width: 18, height: 18 }}>
                    <span className="fw-bold text-secondary" style={{ fontSize: '11px', fontStyle: 'italic', lineHeight: 1 }}>i</span>
                  </div>
                  <div className="rounded-1" style={{ width: 14, height: 14, backgroundColor: col }} />
                </div>
                <div className="fw-bold text-uppercase flex-shrink-0" style={{ color: isDark ? ensureReadableColor(col, isDark) : col, fontSize: '0.75rem', width: '90px', wordWrap: 'break-word' }}>
                  {s}
                </div>
                <div className="d-flex flex-wrap gap-2 flex-grow-1 align-items-center">
                  {miembros.map((a, i) => (
                    <SiluetaPersona key={i} a={a} size={30} />
                  ))}
                </div>
              </div>
              <div className="fw-bold ms-2 flex-shrink-0" style={{ color: isDark ? 'rgba(255,255,255,0.8)' : '#444', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                [{miembros.length}]
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


function PanelIndigenas({ lista, isDark }: { lista: A[]; isDark: boolean }) {
  if (!lista?.length) return null
  return (
    <div className="mt-5">
      <div className="text-center mb-3">
        <span className={`fw-bold text-uppercase ${isDark ? 'text-white-50' : 'text-secondary'}`} style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
          ASAMBLEÍSTAS INDÍGENAS [TOTAL = {lista.length}]
        </span>
      </div>
      <div className="d-flex flex-column gap-0">
        {lista.map((a, i) => {
          const isAcefalo = a.n === 'ACÉFALO' || a.n === 'SIN RESOLUCIÓN' || a.n === 'POR DEFINIR' || a.n.toLowerCase().includes('sin resol');
          const col = a.c || '#888';
          return (
            <div key={i} className="d-flex align-items-center justify-content-between py-3" style={{ borderBottom: i < lista.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` : 'none', borderLeft: `4px solid ${col}`, paddingLeft: '12px' }}>
              <div className="d-flex align-items-center flex-grow-1 gap-3">
                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  <div className={`rounded-circle d-flex align-items-center justify-content-center ${isDark ? 'bg-secondary bg-opacity-25' : 'bg-light border'}`} style={{ width: 18, height: 18 }}>
                    <span className="fw-bold text-secondary" style={{ fontSize: '11px', fontStyle: 'italic', lineHeight: 1 }}>i</span>
                  </div>
                  <div className="rounded-1" style={{ width: 14, height: 14, backgroundColor: col }} />
                </div>
                <div className="fw-bold text-uppercase flex-shrink-0" style={{ color: isDark ? ensureReadableColor(col, isDark) : col, fontSize: '0.75rem', width: '90px', wordWrap: 'break-word' }}>
                  {a.s || 'INDÍGENA'}
                </div>
                <div className="d-flex align-items-center gap-2 flex-grow-1">
                  {isAcefalo ? (
                    <span className="fw-bold text-muted small px-2">SR</span>
                  ) : (
                    <SiluetaPersona a={a} size={30} />
                  )}
                  <span className={`fw-semibold text-uppercase ${isAcefalo ? 'text-danger fst-italic' : ''}`} style={{ fontSize: '0.8rem', color: isDark ? 'rgba(255,255,255,0.9)' : '#222' }}>
                    {a.n}
                  </span>
                </div>
              </div>
              {isAcefalo && (
                <span className="badge bg-warning bg-opacity-25 text-warning border border-warning text-uppercase p-1 ms-2 flex-shrink-0" style={{ fontSize: '0.65rem' }}>
                  Sin Resolución
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   CONCEJO MUNICIPAL (panel municipio)
───────────────────────────────────────────────────────────────── */
function PanelConcejo({ concejales, anio, isDark, municipio }: { concejales: Concejal[]; anio: '2015' | '2021'; isDark: boolean; municipio?: string }) {
  if (!concejales?.length) return (
    <div className={`py-3 text-center small ${isDark ? 'text-white-50' : 'text-secondary'}`}>Sin datos del concejo para {anio}</div>
  )
  const orden: string[] = []; const grupos: Record<string, Concejal[]> = {}
  concejales.forEach(c => { if (!grupos[c.s]) { grupos[c.s] = []; orden.push(c.s) } grupos[c.s].push(c) })
  const total = concejales.length

  return (
    <div className="mt-4">
      <div className="text-center mb-3">
        <span className={`fw-bold text-uppercase ${isDark ? 'text-white-50' : 'text-secondary'}`} style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
          COMPOSICIÓN DEL CONCEJO [TOTAL = {total}]
        </span>
      </div>

      <div className="d-flex flex-column gap-0">
        {orden.map((s, idx) => {
          const miembros = grupos[s];
          const col = miembros[0].c;
          return (
            <div key={s} className="d-flex align-items-center justify-content-between py-3" style={{ borderBottom: idx < orden.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` : 'none', borderLeft: `4px solid ${col}`, paddingLeft: '12px' }}>
              <div className="d-flex align-items-center flex-grow-1 gap-3">
                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  <div className={`rounded-circle d-flex align-items-center justify-content-center ${isDark ? 'bg-secondary bg-opacity-25' : 'bg-light border'}`} style={{ width: 18, height: 18 }}>
                    <span className="fw-bold text-secondary" style={{ fontSize: '11px', fontStyle: 'italic', lineHeight: 1 }}>i</span>
                  </div>
                  <div className="rounded-1" style={{ width: 14, height: 14, backgroundColor: col }} />
                </div>
                <div className="fw-bold text-uppercase flex-shrink-0" style={{ color: isDark ? ensureReadableColor(col, isDark) : col, fontSize: '0.75rem', width: '90px', wordWrap: 'break-word' }}>
                  {s}
                </div>
                <div className="d-flex flex-wrap gap-2 flex-grow-1 align-items-center">
                  {miembros.map((c, i) => (
                    <SiluetaPersona key={i} a={c} size={30} municipio={municipio} />
                  ))}
                </div>
              </div>
              <div className="fw-bold ms-2 flex-shrink-0" style={{ color: isDark ? 'rgba(255,255,255,0.8)' : '#444', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                [{miembros.length}]
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   PANEL MUNICIPIO
───────────────────────────────────────────────────────────────── */
function PanelMunicipio({ mun, anio, isDark }: { mun: DatoMunicipio; anio: '2015' | '2021'; isDark: boolean }) {
  const alcalde = anio === '2021' ? mun.alcalde21 : mun.alcalde15
  const sigla = anio === '2021' ? mun.sigla21 : mun.sigla15
  const pct = anio === '2021' ? mun.pct21 : mun.pct15
  const color = anio === '2021' ? mun.color21 : mun.color15
  const concs = anio === '2021' ? mun.concejales21 : mun.concejales15
  const subs = anio === '2021' ? (mun.subalcaldes21 ?? []) : []
  const secs = anio === '2021' ? (mun.secretarios21 ?? []) : []
  
  return (
    <div className="container-fluid py-4" style={{ maxWidth: 1000 }}>
      {/* Tarjeta Principal de Municipio */}
      <div className={`card shadow-sm border ${isDark ? 'bg-dark text-white border-secondary' : 'bg-white text-dark border-light'}`} style={{ borderRadius: '12px' }}>
        <div className="card-body p-4 p-md-5">
          
          {/* Header */}
          <div className="text-center mb-4">
            <div className={`text-uppercase small fw-semibold tracking-wider ${isDark ? 'text-white-50' : 'text-secondary'}`} style={{ letterSpacing: '0.05em' }}>
              Gobierno Autónomo Municipal
            </div>
            <h1 className="display-6 fw-bold mt-2 mb-0" style={{ color: isDark ? '#fff' : '#1a2942' }}>
              {mun.nombre}
            </h1>
          </div>

          <hr className={isDark ? 'border-secondary' : 'border-light'} />

          {/* Alcalde Table */}
          <div className="table-responsive my-4 overflow-hidden">
            <table className="table table-borderless align-middle mb-0" style={{ color: 'inherit' }}>
              <tbody>
                <tr style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                  <td className="fw-bold py-3" style={{ width: '35%', fontSize: '0.8rem', letterSpacing: '0.02em' }}>ALCALDE</td>
                  <td className="py-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="flex-shrink-0">
                        <SiluetaAuto nombre={alcalde ?? ''} color={color ?? '#888'} size={32} />
                      </div>
                      <span className={`small fw-semibold text-uppercase ${isDark ? 'text-light' : 'text-secondary'}`} style={{ lineHeight: 1.4 }}>
                        {alcalde ?? '— Sin datos —'}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                  <td className="fw-bold py-3" style={{ fontSize: '0.8rem', letterSpacing: '0.02em' }}>PARTIDO</td>
                  <td className={`py-3 small fw-semibold text-uppercase ${isDark ? 'text-light' : 'text-secondary'}`}>{sigla ?? '—'}</td>
                </tr>
                <tr style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                  <td className="fw-bold py-3" style={{ fontSize: '0.8rem', letterSpacing: '0.02em' }}>PORCENTAJE DE<br/>VOTOS</td>
                  <td className={`py-3 small fw-semibold text-uppercase ${isDark ? 'text-light' : 'text-secondary'}`}>{pct != null ? `${pct.toFixed(2)}%` : '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Concejo */}
          <PanelConcejo concejales={concs} anio={anio} isDark={isDark} municipio={mun.nombre} />

        </div>
      </div>

      {/* Subalcaldes */}
      {subs.length > 0 && (
        <section className="mt-4">
          <h3 className="h6 fw-bold text-uppercase mb-3 ps-2">
            🏘️ Subalcaldes <span className="badge bg-success bg-opacity-25 text-success rounded-pill ms-2">{subs.length}</span>
          </h3>
          <div className="row g-3">
            {subs.map((s, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-4">
                <div className={`card shadow-sm h-100 ${isDark ? 'bg-dark text-white border-secondary' : 'bg-white text-dark'}`} style={{ borderRadius: '10px' }}>
                  <div className="card-body p-3 d-flex align-items-center gap-3">
                    <SiluetaAuto nombre={s.n} color={color} size={26} tooltip={`${s.n} · ${s.zona} · ${mun.nombre}`} />
                    <div className="text-truncate">
                      <div className="small fw-bold text-success mb-1" style={{ fontSize: '0.75rem' }}>{s.zona}</div>
                      <div className={`fw-semibold text-truncate ${s.n === 'ACÉFALO' ? 'text-danger fst-italic' : ''}`} style={{ fontSize: '0.9rem' }}>
                        {s.n === 'ACÉFALO' ? 'Acéfalo' : s.n}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Secretarios */}
      {secs.length > 0 && (
        <section className="mt-4">
          <h3 className="h6 fw-bold text-uppercase mb-3 ps-2">Secretarios Municipales</h3>
          <div className="row g-3">
            {secs.map((s, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-4">
                <div className={`card shadow-sm h-100 border-start ${isDark ? 'bg-dark text-white border-secondary' : 'bg-white text-dark'}`} style={{ borderLeftWidth: '4px', borderLeftColor: color, borderRadius: '10px' }}>
                  <div className="card-body p-3 d-flex align-items-center gap-3">
                    <SiluetaAuto nombre={s.n} color={color} size={28} tooltip={`${s.n} · ${s.cargo} · ${mun.nombre}`} />
                    <div className="text-truncate">
                      <p className="small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>{s.cargo}</p>
                      <p className={`fw-bold mb-0 text-truncate ${s.n === 'ACÉFALO' ? 'text-danger fst-italic' : ''}`} style={{ fontSize: '0.9rem' }}>
                        {s.n === 'ACÉFALO' ? 'Acéfalo' : s.n}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   PANEL DEPTO
───────────────────────────────────────────────────────────────── */
function PanelDepto({ cod, anio, deptosData, isDark }: { cod: string | null; anio: '2015' | '2021'; deptosData: Record<string, DatoDepto>; isDark: boolean }) {
  if (!cod) return (
    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center gap-3">
      <svg width="50" height="60" viewBox="0 0 50 60">
        <path d="M25 3 L47 18 L47 55 L3 55 L3 18 Z" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="25" cy="38" r="7" fill="rgba(255,255,255,0.1)" />
      </svg>
      <span className="small text-white-50">Selecciona un departamento en el mapa</span>
    </div>
  )
  const d = deptosData[cod]; if (!d) return <div className="p-4 text-white-50">Cargando…</div>
  const ganador = anio === '2021' ? d.gan21 : d.gan15
  const sv = anio === '2021' ? d.sv : null
  const gc = ganador?.color ?? '#888'
  const territorio = anio === '2021' ? d.territorio21 : d.territorio15
  const poblacion = anio === '2021' ? d.poblacion21 : d.poblacion15
  const indigena = anio === '2021' ? d.indigena21 : d.indigena15

  return (
    <div className="container-fluid py-4" style={{ maxWidth: 1000 }}>
      {/* Tarjeta Principal de Departamento */}
      <div className={`card shadow-sm border ${isDark ? 'bg-dark text-white border-secondary' : 'bg-white text-dark border-light'}`} style={{ borderRadius: '12px' }}>
        <div className="card-body p-4 p-md-5">
          
          {/* Header */}
          <div className="text-center mb-4">
            <div className={`small fw-semibold ${isDark ? 'text-white-50' : 'text-secondary'}`} style={{ fontSize: '1.1rem', letterSpacing: '0.01em' }}>
              Gobierno Autónomo<br/>Departamental de
            </div>
            <h1 className="display-6 fw-bold mt-2 mb-0" style={{ color: isDark ? '#fff' : '#1a2942' }}>
              {d.nombre}
            </h1>
          </div>

          <hr className={isDark ? 'border-secondary' : 'border-light'} />
          {/* Lógica de Segunda Vuelta o Ganador Directo */}
          {sv && (
            <>
              {/* Banner Hubo Segunda Vuelta */}
              <div className="text-center my-3">
                <div className="fw-bold text-white small py-1" style={{ background: 'linear-gradient(90deg, #e30000 0%, #ffa500 50%, #8a2be2 100%)', letterSpacing: '0.05em' }}>
                  HUBO SEGUNDA VUELTA
                </div>
              </div>

              <div className="text-center mt-4 mb-3">
                 <span className={`fw-bold text-uppercase ${isDark ? 'text-white-50' : 'text-secondary'}`} style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                  DATOS PRIMERA VUELTA GOBERNACIÓN
                </span>
              </div>

              <div className="table-responsive mb-2 overflow-hidden">
                <table className="table table-borderless align-middle mb-0" style={{ color: 'inherit' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                      <th className="fw-bold py-2" style={{ fontSize: '0.75rem', letterSpacing: '0.02em', width: '45%' }}>CANDIDATO</th>
                      <th className="fw-bold py-2" style={{ fontSize: '0.75rem', letterSpacing: '0.02em', width: '30%' }}>PARTIDO</th>
                      <th className="fw-bold py-2 text-end" style={{ fontSize: '0.75rem', letterSpacing: '0.02em' }}>Porcentaje de<br/>Votos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sv.candidatos1v.map((c, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                        <td className="py-3">
                          <span className={`small fw-semibold text-uppercase ${isDark ? 'text-light' : 'text-secondary'}`} style={{ lineHeight: 1.4 }}>
                            {c.nombre}
                          </span>
                        </td>
                        <td className={`py-3 small fw-semibold text-uppercase ${isDark ? 'text-light' : 'text-secondary'}`}>
                          {c.sigla}
                        </td>
                        <td className={`py-3 small fw-semibold text-end ${isDark ? 'text-light' : 'text-secondary'}`}>
                          {c.pct1v.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-center mb-4 mt-2">
                <span className={`small fst-italic ${isDark ? 'text-white-50' : 'text-secondary'}`}>
                  (Diferencia de votos: {sv.diferencia.toLocaleString()})
                </span>
              </div>

              <hr className={isDark ? 'border-secondary' : 'border-light'} />

              <div className="text-center mt-4 mb-2">
                 <span className={`fw-bold text-uppercase ${isDark ? 'text-white-50' : 'text-secondary'}`} style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                  DATOS SEGUNDA VUELTA GOBERNACIÓN
                </span>
              </div>
            </>
          )}

          {!sv && (
            <div className="text-center mt-3 mb-2">
               <span className={`fw-bold text-uppercase ${isDark ? 'text-white-50' : 'text-secondary'}`} style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                GANADOR EN PRIMERA VUELTA
              </span>
            </div>
          )}

          <div className="table-responsive my-4 overflow-hidden">
            <table className="table table-borderless align-middle mb-0" style={{ color: 'inherit' }}>
              <tbody>
                <tr style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                  <td className="fw-bold py-3" style={{ width: '35%', fontSize: '0.8rem', letterSpacing: '0.02em' }}>GOBERNADOR</td>
                  <td className="py-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="flex-shrink-0">
                        <SiluetaAuto nombre={ganador?.nombre ?? ''} color={gc} size={32} />
                      </div>
                      <span className={`small fw-semibold text-uppercase ${isDark ? 'text-light' : 'text-secondary'}`} style={{ lineHeight: 1.4 }}>
                        {ganador?.nombre ?? '— Sin datos —'}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                  <td className="fw-bold py-3" style={{ fontSize: '0.8rem', letterSpacing: '0.02em' }}>PARTIDO</td>
                  <td className={`py-3 small fw-semibold text-uppercase ${isDark ? 'text-light' : 'text-secondary'}`}>{ganador?.sigla ?? '—'}</td>
                </tr>
                <tr style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                  <td className="fw-bold py-3" style={{ fontSize: '0.8rem', letterSpacing: '0.02em' }}>PORCENTAJE DE<br/>VOTOS</td>
                  <td className={`py-3 small fw-semibold text-uppercase ${isDark ? 'text-light' : 'text-secondary'}`}>{sv ? `${sv.ganador2vPct.toFixed(2)}%` : ganador?.pct ? `${ganador.pct.toFixed(2)}%` : '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Asambleístas */}
          <GridAsambleistas lista={territorio} titulo="ASAMBLEISTAS POR TERRITORIO" isDark={isDark} />
          
          <div className="mt-5">
            <GridAsambleistas lista={poblacion} titulo="ASAMBLEISTAS POR POBLACIÓN" isDark={isDark} />
          </div>

          <div className="mt-5">
            <PanelIndigenas lista={indigena} isDark={isDark} />
          </div>

        </div>
      </div>

      {/* Subgobernadores */}
      {(() => {
        const lista = anio === '2021' ? (d.subgobs21 ?? []) : (d.subgobs15 ?? [])
        if (!lista.length) return null
        const siglaColor: Record<string, string> = {}
        ;(d.cands21 ?? []).forEach(c => { siglaColor[c.sigla] = c.color })
        ;[...territorio, ...poblacion, ...indigena].forEach(a => { if (a.s && a.c) siglaColor[a.s] = a.c })
        return (
          <section className="mt-4">
            <h3 className="h6 fw-bold text-uppercase mb-3 ps-2">
              🏛️ Subgobernadores <span className="badge bg-success bg-opacity-25 text-success rounded-pill ms-2">{lista.length}</span>
            </h3>
            <div className="row g-3">
              {lista.map((sg, i) => {
                const sgColor = (sg.s && sg.s !== '.' && siglaColor[sg.s]) ? siglaColor[sg.s] : gc
                return (
                  <div key={i} className="col-12 col-md-6 col-lg-4">
                    <div className={`card shadow-sm h-100 ${isDark ? 'bg-dark text-white border-secondary' : 'bg-white text-dark'}`} style={{ borderRadius: '10px' }}>
                      <div className="card-body p-3 d-flex align-items-center gap-3">
                        <SiluetaAuto nombre={sg.n} color={sgColor} size={26} tooltip={`${sg.n}${sg.s && sg.s !== '.' ? ' · ' + sg.s : ''}${'prov' in sg && (sg as any).prov ? ' · ' + (sg as any).prov : ''}`} />
                        <div className="text-truncate flex-grow-1">
                          {'prov' in sg && (sg as any).prov && <div className="small fw-bold text-info mb-1" style={{ fontSize: '0.75rem' }}>{(sg as any).prov}</div>}
                          <div className="fw-semibold text-truncate" style={{ fontSize: '0.9rem' }}>{sg.n}</div>
                        </div>
                        {sg.s && sg.s !== '.' && (
                          <span className="badge py-1 px-2 flex-shrink-0" style={{ backgroundColor: `${sgColor}33`, color: ensureReadableColor(sgColor, isDark), fontSize: '0.7rem' }}>{sg.s}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })()}

      {/* Corregidores — solo Beni 2021 */}
      {anio === '2021' && (d.corregidores21 ?? []).length > 0 && (
        <section className="mt-4">
          <h3 className="h6 fw-bold text-uppercase mb-3 ps-2">
            🌿 Corregidores <span className="badge bg-success bg-opacity-25 text-success rounded-pill ms-2">{d.corregidores21.length}</span>
          </h3>
          <div className="row g-2">
            {d.corregidores21.map((c, i) => (
              <div key={i} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className={`card shadow-sm h-100 ${isDark ? 'bg-dark text-white border-secondary' : 'bg-white text-dark'}`} style={{ borderRadius: '10px' }} title={`${c.n} · ${c.s}`}>
                  <div className="card-body p-2 d-flex align-items-center gap-2">
                    <SiluetaAuto nombre={c.n} color={c.c || gc} size={22} tooltip={`${c.n} · ${c.s}`} />
                    <span className="small fw-semibold text-truncate flex-grow-1" style={{ fontSize: '0.85rem' }}>{c.n}</span>
                    {c.s && <span className="badge py-1 px-2 flex-shrink-0" style={{ backgroundColor: `${c.c || gc}33`, color: ensureReadableColor(c.c || gc, isDark), fontSize: '0.65rem' }}>{c.s}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Secretarios de Despacho */}
      {anio === '2021' && d.secretarios21?.length > 0 && (
        <section className="mt-4">
          <h3 className="h6 fw-bold text-uppercase mb-3 ps-2">
            Secretarios de Despacho <span className="badge bg-info bg-opacity-25 text-info rounded-pill ms-2">{d.secretarios21.length}</span>
          </h3>
          <div className="row g-3">
            {d.secretarios21.map((s, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-4">
                <div className={`card shadow-sm h-100 border-start ${isDark ? 'bg-dark text-white border-secondary' : 'bg-white text-dark'}`} style={{ borderLeftWidth: '4px', borderLeftColor: gc, borderRadius: '10px' }}>
                  <div className="card-body p-3 d-flex align-items-center gap-3">
                    <SiluetaAuto nombre={s.n} color={gc} size={28} tooltip={`${s.n} · ${s.cargo}`} />
                    <div className="text-truncate">
                      <p className="small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>{s.cargo}</p>
                      <p className="fw-bold mb-0 text-truncate" style={{ fontSize: '0.9rem' }}>{s.n}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Directores */}
      {anio === '2021' && (d.directores21 ?? []).length > 0 && (
        <section className="mt-4 mb-2">
          <h3 className="h6 fw-bold text-uppercase mb-3 ps-2">
            📋 Directores <span className="badge bg-success bg-opacity-25 text-success rounded-pill ms-2">{d.directores21!.length}</span>
          </h3>
          <div className="row g-3">
            {d.directores21!.map((s, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-4">
                <div className={`card shadow-sm h-100 border-start ${isDark ? 'bg-dark text-white border-secondary' : 'bg-white text-dark'}`} style={{ borderLeftWidth: '4px', borderLeftColor: gc, borderRadius: '10px' }}>
                  <div className="card-body p-3 d-flex align-items-center gap-3">
                    <SiluetaAuto nombre={s.n} color={gc} size={28} tooltip={`${s.n} · ${s.cargo}`} />
                    <div className="text-truncate">
                      <p className="small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>{s.cargo}</p>
                      <p className="fw-bold mb-0 text-truncate" style={{ fontSize: '0.9rem' }}>{s.n}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────────────────────────────── */
const API_BASE = 'https://seamovil.com/app/api/apiMap.php'

export default function MapaEleccionesCompleto() {
  const [isDark, setIsDark] = useState(true);
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
    <>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
      <div className={`d-flex flex-column vh-100 overflow-hidden ${isDark ? 'bg-dark text-white' : 'bg-light text-dark'}`} style={{ fontFamily: "'sinkin_sans200_x_light',system-ui,sans-serif" }}>

      {/* HEADER */}
      <header className={`d-flex align-items-center justify-content-between px-3 py-2 border-bottom shadow-sm flex-wrap gap-2 ${isDark ? 'border-secondary' : 'bg-white border-light'}`} style={{ minHeight: 56, background: isDark ? 'rgba(8, 176, 167, 0.08)' : 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)' }}>
        <div className="d-flex align-items-center gap-3">
          <div className="rounded" style={{ width: 5, height: 34, background: 'linear-gradient(180deg, #08B0A7, #A6CE3E)', flexShrink: 0 }} />
          <div>
            <div className="fw-bold fs-6 tracking-wide">Elecciones Subnacionales — Bolivia</div>
            <div className={`small ${isDark ? 'text-white-50' : 'text-muted'}`}>
              {deptoActivo && deptosData[deptoActivo]
                ? `${deptosData[deptoActivo].nombre} · Haz clic en un municipio para ver alcalde y concejo`
                : 'Gobernaciones · Haz clic en un departamento para ver municipios'}
            </div>
          </div>
        </div>

        {/* Buscador */}
        <div className="flex-grow-1 mx-3" style={{ maxWidth: 400, minWidth: 200 }}>
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
                    color: isDark ? '#fff' : '#000',
                    fontFamily: 'sinkin_sans200_x_light',
                    fontSize: 13,
                    background: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.05)',
                    borderRadius: '8px',
                    height: 36,
                    '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' },
                    '&:hover fieldset': { borderColor: '#08B0A7' },
                    '&.Mui-focused fieldset': { borderColor: '#08B0A7' },
                  },
                  '& .MuiInputBase-input::placeholder': { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', opacity: 1 },
                  '& .MuiSvgIcon-root': { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' },
                }}
              />
            )}
            slotProps={{
              paper: {
                sx: {
                  background: isDark ? 'rgba(20,30,50,0.97)' : 'rgba(255,255,255,0.97)',
                  backdropFilter: 'blur(12px)',
                  color: isDark ? '#fff' : '#000',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  fontFamily: 'sinkin_sans200_x_light',
                  '& .MuiAutocomplete-groupLabel': { color: '#08B0A7', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8 },
                  '& .MuiAutocomplete-option': { fontSize: 12, '&:hover': { background: isDark ? 'rgba(8,176,167,0.15)' : 'rgba(8,176,167,0.1)' }, '&[aria-selected=true]': { background: isDark ? 'rgba(8,176,167,0.25) !important' : 'rgba(8,176,167,0.15) !important' } },
                }
              }
            }}
          />
        </div>

        <div className="d-flex gap-2 align-items-center flex-wrap">
          <div className="btn-group shadow-sm border border-secondary border-opacity-25">
            {(['2015', '2021'] as const).map(a => (
              <button key={a} onClick={() => setAnio(a)} className={`btn btn-sm px-4 fw-bold ${anio === a ? 'btn-warning text-white' : (isDark ? 'btn-dark text-white-50' : 'btn-light text-muted')}`}>{a}</button>
            ))}
          </div>
        </div>
      </header>

      <div className="row m-0 flex-grow-1 overflow-hidden">

        {/* MAPA */}
        <div className={`col-12 col-lg-7 p-0 position-relative border-end h-100 ${isDark ? 'border-secondary' : 'border-light'}`}>
          {isLoading
            ? <div className="d-flex align-items-center justify-content-center h-100 fw-bold fs-5 gap-3" style={{ color: '#08B0A7' }}>
              <div className="spinner-border text-info" role="status"><span className="visually-hidden">Loading...</span></div>
              Cargando mapa y datos…
            </div>
            : geoDep && (
              <MapContainer ref={mapRef} center={CENTRO} zoom={6} minZoom={5} scrollWheelZoom style={{ width: '100%', height: '100%' }}>
                <TileLayer url={`https://{s}.basemaps.cartocdn.com/${isDark ? 'dark' : 'light'}_nolabels/{z}/{x}/{y}{r}.png`} attribution="&copy; CartoDB" />
                <GeoJSON key={`dep-${anio}-${deptoActivo ?? 'x'}`} ref={geoDepRef} data={geoDep} style={estiloDep} onEachFeature={onEachDep} />
                {deptoActivo && geoMunFilt && geoMunFilt.features.length > 0 && (
                  <GeoJSON key={`mun-${anio}-${deptoActivo}-${munActiva ?? 'x'}`} ref={geoMunRef} data={geoMunFilt} style={estiloMun} onEachFeature={onEachMun} />
                )}
                <ClickHandler fn={handleMapClick} />
              </MapContainer>
            )
          }
          {/* Leyenda */}
          <div className={`position-absolute bottom-0 start-0 m-3 z-3 p-3 rounded-3 shadow border ${isDark ? 'bg-dark bg-opacity-75 text-white border-secondary' : 'bg-white bg-opacity-75 text-dark border-light'}`} style={{ backdropFilter: 'blur(10px)', maxHeight: '50vh', overflowY: 'auto' }}>
            <div className="small fw-bold text-uppercase tracking-wider mb-2" style={{ color: '#08B0A7' }}>{leyenda.tipo} {anio}</div>
            {leyenda.entries.map(([sigla, color]) => (
              <div key={sigla} className="d-flex align-items-center gap-2 mb-1">
                <div className="rounded" style={{ width: 12, height: 12, background: color, boxShadow: `0 0 6px ${color}44` }} />
                <span className={`small fw-medium ${isDark ? 'text-white-50' : 'text-muted'}`}>{sigla}</span>
              </div>
            ))}
          </div>
          {/* Badge activo */}
          {(deptoActivo || munActiva) && (
            <div className="position-absolute top-0 start-50 translate-middle-x mt-3 z-3 bg-info bg-opacity-75 text-white px-4 py-2 rounded-pill fw-bold shadow-sm d-flex align-items-center gap-2 border border-white border-opacity-25" style={{ backdropFilter: 'blur(8px)', whiteSpace: 'nowrap' }}>
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
              }} className="btn btn-sm btn-link text-white text-decoration-none p-0 lh-1 fs-5 ms-2">✕</button>
            </div>
          )}
        </div>

        {/* PANEL */}
        <div className={`col-12 col-lg-5 p-0 d-flex flex-column h-100 ${isDark ? 'bg-dark bg-opacity-75' : 'bg-light'}`} style={{ backdropFilter: isDark ? 'blur(16px)' : 'none', transition: 'background 0.3s' }}>
          {/* Breadcrumb */}
          <div className={`px-3 py-2 d-flex align-items-center gap-2 flex-wrap border-bottom ${isDark ? 'bg-dark bg-opacity-10 border-secondary' : 'bg-white border-light'}`}>
            {deptoActivo && deptosData[deptoActivo] ? (
              <button onClick={() => { setVista('depto'); setMunActiva(null) }}
                className={`btn btn-link p-0 text-decoration-none fw-bold small ${vista === 'depto' ? 'text-info' : (isDark ? 'text-white-50' : 'text-muted')}`}>
                🏛️ {deptosData[deptoActivo].nombre}
              </button>
            ) : (
              <span className={`small fw-semibold ${isDark ? 'text-white-50' : 'text-muted'}`}>Haz clic en un departamento · {anio}</span>
            )}
            {munData && (
              <><span className={`small ${isDark ? 'text-white-50' : 'text-muted'}`}>›</span>
                <span className="small fw-bold text-success">🏘️ {munData.nombre}</span></>
            )}
            <span className="badge bg-info bg-opacity-10 text-info ms-auto">{anio}</span>
            <button
              onClick={() => setIsDark(prev => !prev)}
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className={`btn btn-sm ${isDark ? 'btn-outline-secondary text-white' : 'btn-outline-dark'}`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
          <div className={`flex-grow-1 overflow-auto ${isDark ? 'dark-panel-scroll' : 'light-panel-scroll'}`}>
            {vista === 'municipio' && munData
              ? <PanelMunicipio mun={munData} anio={anio} isDark={isDark} />
              : <PanelDepto cod={deptoActivo} anio={anio} deptosData={deptosData} isDark={isDark} />
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
        .light-panel-scroll::-webkit-scrollbar { width: 6px; }
        .light-panel-scroll::-webkit-scrollbar-track { background: transparent; }
        .light-panel-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 3px; }
        .light-panel-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.25); }
      `}</style>
    </div>
    </>
  )
}