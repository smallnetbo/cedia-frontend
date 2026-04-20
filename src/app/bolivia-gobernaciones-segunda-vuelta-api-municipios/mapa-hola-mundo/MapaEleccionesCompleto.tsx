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
function GridAsambleistas({ lista, titulo, icono, isDark }: { lista: A[]; titulo: string; icono: string; isDark: boolean }) {
  if (!lista?.length) return null
  const orden: string[] = []; const grupos: Record<string, A[]> = {}
  lista.forEach(a => { if (!grupos[a.s]) { grupos[a.s] = []; orden.push(a.s) } grupos[a.s].push(a) })
  const total = lista.length

  return (
    <section style={{ background: isDark ? '#1E293B' : '#fff', padding: 24, borderRadius: 16, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: isDark ? '#fff' : '#0f172a', fontSize: 16 }}>
          <span>{icono}</span>
          {titulo}
        </h3>
        <span style={{ fontSize: 14, fontWeight: 500, padding: '4px 8px', background: isDark ? '#334155' : '#f1f5f9', borderRadius: 4, color: isDark ? '#fff' : '#0f172a' }}>
          Total: {total}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
        {/* Barra proporcional */}
        <div style={{ height: 16, width: '100%', background: isDark ? '#334155' : '#e2e8f0', borderRadius: 9999, overflow: 'hidden', display: 'flex' }}>
          {orden.map(s => {
            const count = grupos[s].length;
            const pct = (count / total) * 100;
            const col = grupos[s][0].c;
            return <div key={s} style={{ width: `${pct}%`, background: col }} />
          })}
        </div>

        {/* Siluetas agrupadas por partido */}
        {orden.map(s => {
          const miembros = grupos[s];
          const count = miembros.length;
          const m = miembros.filter(x => x.g === 'MASCULINO').length;
          const f = miembros.filter(x => x.g === 'FEMENINO').length;
          const col = miembros[0].c;
          return (
            <div key={s} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: col, flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, color: isDark ? '#fff' : '#0f172a', fontSize: 14 }}>{s}</span>
                </span>
                <span style={{ fontWeight: 700, fontSize: 13, color: isDark ? '#e2e8f0' : '#334155' }}>
                  {count} ({m}♂ {f}♀)
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, padding: '6px 8px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: 8 }}>
                {miembros.map((a, i) => (
                  <SiluetaPersona key={i} a={a} size={20} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function PanelIndigenas({ lista, isDark }: { lista: A[]; isDark: boolean }) {
  if (!lista?.length) return null
  return (
    <section style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.025em', color: isDark ? '#fff' : '#0f172a' }}>Asambleístas Indígenas</h3>
        <span style={{ background: 'rgba(217, 119, 6, 0.2)', color: isDark ? '#fcd34d' : '#d97706', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 9999, border: '1px solid rgba(217, 119, 6, 0.3)' }}>
          {lista.length} ESCAÑOS
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {lista.map((a, i) => {
          const isAcefalo = a.n === 'ACÉFALO' || a.n === 'SIN RESOLUCIÓN' || a.n === 'POR DEFINIR' || a.n.toLowerCase().includes('sin resol');
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: isDark ? '#1E293B' : '#fff', borderRadius: 12, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {isAcefalo
                    ? <span style={{ fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}>SR</span>
                    : <SiluetaPersona a={a} size={28} />
                  }
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: isDark ? '#fff' : '#0f172a', margin: 0, fontSize: 15 }}>{a.n}</p>
                  <p style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', fontStyle: 'italic', margin: 0, marginTop: 2 }}>{a.s}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {isAcefalo && <span style={{ padding: '4px 10px', background: 'rgba(217, 119, 6, 0.15)', color: isDark ? '#fcd34d' : '#d97706', fontSize: 10, fontWeight: 700, borderRadius: 6, border: '1px solid rgba(217, 119, 6, 0.3)', textTransform: 'uppercase' }}>Sin Resolución</span>}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────
   CONCEJO MUNICIPAL (panel municipio)
───────────────────────────────────────────────────────────────── */
function PanelConcejo({ concejales, anio, isDark, municipio }: { concejales: Concejal[]; anio: '2015' | '2021'; isDark: boolean; municipio?: string }) {
  if (!concejales?.length) return (
    <div style={{ padding: '10px 0', fontSize: 12, color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)', textAlign: 'center' }}>Sin datos del concejo para {anio}</div>
  )
  const orden: string[] = []; const grupos: Record<string, Concejal[]> = {}
  concejales.forEach(c => { if (!grupos[c.s]) { grupos[c.s] = []; orden.push(c.s) } grupos[c.s].push(c) })
  const total = concejales.length

  return (
    <section style={{ background: isDark ? '#1E293B' : '#fff', padding: 24, borderRadius: 16, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: isDark ? '#fff' : '#0f172a', fontSize: 16 }}>
          <span>🏛️</span>
          Concejo Municipal
        </h3>
        <span style={{ fontSize: 14, fontWeight: 500, padding: '4px 8px', background: isDark ? '#334155' : '#f1f5f9', borderRadius: 4, color: isDark ? '#fff' : '#0f172a' }}>
          Total: {total}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
        {/* Barra proporcional */}
        <div style={{ height: 16, width: '100%', background: isDark ? '#334155' : '#e2e8f0', borderRadius: 9999, overflow: 'hidden', display: 'flex' }}>
          {orden.map(s => {
            const count = grupos[s].length;
            const pct = (count / total) * 100;
            const col = grupos[s][0].c;
            return <div key={s} style={{ width: `${pct}%`, background: col }} />
          })}
        </div>

        {/* Siluetas agrupadas por partido */}
        {orden.map(s => {
          const miembros = grupos[s];
          const count = miembros.length;
          const m = miembros.filter(x => x.g === 'MASCULINO').length;
          const f = miembros.filter(x => x.g === 'FEMENINO').length;
          const col = miembros[0].c;
          return (
            <div key={s} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: col, flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, color: isDark ? '#fff' : '#0f172a', fontSize: 14 }}>{s}</span>
                </span>
                <span style={{ fontWeight: 700, fontSize: 13, color: isDark ? '#e2e8f0' : '#334155' }}>
                  {count} ({m}♂ {f}♀)
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, padding: '6px 8px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: 8 }}>
                {miembros.map((c, i) => (
                  <SiluetaPersona key={i} a={c} size={20} municipio={municipio} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
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
    <div style={{ paddingBottom: 24, margin: '0 auto', maxWidth: 1000 }}>
      {/* Encabezado alcalde */}
      <header style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', background: isDark ? '#1E293B' : '#fff', padding: 24, borderRadius: 16, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}` }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#94a3b8' : '#64748b', marginBottom: 6 }}>
              Municipio de {mun.nombre} · Alcalde/sa {anio}
            </p>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: isDark ? '#fff' : '#0f172a', margin: 0, lineHeight: 1.2 }}>
              {alcalde ?? '— Sin datos —'}
            </h1>
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {sigla && <span style={{ padding: '4px 16px', borderRadius: 9999, background: `${color}33`, color: ensureReadableColor(color, isDark), fontWeight: 700, fontSize: 14 }}>
                {sigla}
              </span>}
              {pct != null && <span style={{ fontSize: 26, fontWeight: 700, color: ensureReadableColor(color, isDark) }}>
                {pct.toFixed(2)}%
              </span>}
            </div>
          </div>
        </div>
      </header>

      {/* Concejo */}
      <PanelConcejo concejales={concs} anio={anio} isDark={isDark} municipio={mun.nombre} />

      {/* Subalcaldes */}
      {subs.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.025em', color: isDark ? '#fff' : '#0f172a', marginBottom: 16 }}>
            🏘️ Subalcaldes <span style={{ background: 'rgba(166,206,62,0.2)', color: isDark ? '#A6CE3E' : '#65a30d', fontSize: 12, padding: '4px 10px', borderRadius: 9999, marginLeft: 8 }}>{subs.length}</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            {subs.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: isDark ? '#1E293B' : '#fff', borderRadius: 12, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}` }}>
                <SiluetaAuto nombre={s.n} color={color} size={26} tooltip={`${s.n} · ${s.zona} · ${mun.nombre}`} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#A6CE3E' : '#65a30d', marginBottom: 4 }}>{s.zona}</div>
                  <div style={{ fontSize: 15, color: s.n === 'ACÉFALO' ? '#ef5350' : (isDark ? '#fff' : '#0f172a'), fontWeight: 600, fontStyle: s.n === 'ACÉFALO' ? 'italic' : 'normal', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.n === 'ACÉFALO' ? 'Acéfalo' : s.n}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Secretarios */}
      {secs.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.025em', color: isDark ? '#fff' : '#0f172a', marginBottom: 16 }}>Secretarios Municipales</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            {secs.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, background: isDark ? '#1E293B' : '#fff', padding: 20, borderRadius: 12, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', borderLeft: `4px solid ${color}` }}>
                <SiluetaAuto nombre={s.n} color={color} size={28} tooltip={`${s.n} · ${s.cargo} · ${mun.nombre}`} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, margin: 0 }}>{s.cargo}</p>
                  <p style={{ fontSize: 16, color: s.n === 'ACÉFALO' ? '#ef5350' : (isDark ? '#fff' : '#0f172a'), fontWeight: 700, fontStyle: s.n === 'ACÉFALO' ? 'italic' : 'normal', margin: 0 }}>
                    {s.n === 'ACÉFALO' ? 'Acéfalo' : s.n}
                  </p>
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
  const sv = anio === '2021' ? d.sv : null
  const gc = ganador?.color ?? '#888'
  const territorio = anio === '2021' ? d.territorio21 : d.territorio15
  const poblacion = anio === '2021' ? d.poblacion21 : d.poblacion15
  const indigena = anio === '2021' ? d.indigena21 : d.indigena15

  return (
    <div style={{ paddingBottom: 24, margin: '0 auto', maxWidth: 1000 }}>
      {/* Gobernador */}
      <header style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', background: isDark ? '#1E293B' : '#fff', padding: 24, borderRadius: 16, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}` }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#94a3b8' : '#64748b', marginBottom: 6 }}>
              Gobernador/a electo/a {anio} {sv ? '(2ª Vuelta)' : ''}
            </p>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: isDark ? '#fff' : '#0f172a', margin: 0, lineHeight: 1.2 }}>
              {ganador?.nombre ?? '—'}
            </h1>
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {ganador?.sigla && <span style={{ padding: '4px 16px', borderRadius: 9999, background: `${gc}33`, color: ensureReadableColor(gc, isDark), fontWeight: 700, fontSize: 14 }}>
                {ganador.sigla}
              </span>}
              <span style={{ fontSize: 26, fontWeight: 700, color: ensureReadableColor(gc, isDark) }}>
                {sv ? sv.ganador2vPct.toFixed(2) : ganador?.pct?.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2ª vuelta */}
      {sv && (
        <div style={{ marginBottom: 32, border: '1px solid rgba(255,193,7,0.3)', borderRadius: 16, overflow: 'hidden', background: isDark ? '#1E293B' : '#fff' }}>
          <div style={{ background: 'rgba(255,193,7,0.08)', padding: '12px 20px', borderBottom: '1px solid rgba(255,193,7,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>📊</span>
            <span style={{ fontWeight: 800, fontSize: 13, color: isDark ? '#fcd34d' : '#d97706', textTransform: 'uppercase', letterSpacing: 0.6 }}>1ª Vuelta (pasó a 2ª)</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, background: 'rgba(255,193,7,0.12)', border: '1px solid rgba(255,193,7,0.3)', borderRadius: 6, padding: '4px 10px', color: isDark ? '#fcd34d' : '#d97706' }}>Dif: {sv.diferencia.toLocaleString()} votos</span>
          </div>
          <div style={{ padding: '20px', background: 'rgba(255,193,7,0.02)' }}>
            {sv.candidatos1v.map((c, i) => {
              const maxP = Math.max(...sv.candidatos1v.map(x => x.pct1v))
              return (
                <div key={i} style={{ marginBottom: i < sv.candidatos1v.length - 1 ? 16 : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: c.color, flexShrink: 0, boxShadow: `0 0 6px ${c.color}44` }} />
                      <div><span style={{ fontSize: 15, fontWeight: c.pct1v === maxP ? 700 : 500, color: c.pct1v === maxP ? (isDark ? '#fff' : '#0f172a') : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)') }}>{c.nombre}</span><span style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', marginLeft: 8 }}>{c.sigla}</span></div>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 800, color: ensureReadableColor(c.color, isDark) }}>{c.pct1v.toFixed(2)}%</span>
                  </div>
                  <div style={{ height: 10, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min((c.pct1v / 55) * 100, 100)}%`, background: c.color, borderRadius: 5, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Asambleístas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 32 }}>
        <GridAsambleistas lista={territorio} titulo="Asambleístas por Territorio" icono="🗺️" isDark={isDark} />
        <GridAsambleistas lista={poblacion} titulo="Asambleístas por Población" icono="👥" isDark={isDark} />
      </div>

      <PanelIndigenas lista={indigena} isDark={isDark} />

      {/* Subgobernadores */}
      {(() => {
        const lista = anio === '2021' ? (d.subgobs21 ?? []) : (d.subgobs15 ?? [])
        if (!lista.length) return null
        // Mapa sigla → color a partir de los candidatos del departamento
        const siglaColor: Record<string, string> = {}
        ;(d.cands21 ?? []).forEach(c => { siglaColor[c.sigla] = c.color })
        // También agregar colores de asambleístas por si hay siglas extra
        ;[...territorio, ...poblacion, ...indigena].forEach(a => { if (a.s && a.c) siglaColor[a.s] = a.c })
        return (
          <section style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.025em', color: isDark ? '#fff' : '#0f172a', marginBottom: 16 }}>
              🏛️ Subgobernadores <span style={{ background: 'rgba(8,176,167,0.2)', color: '#08B0A7', fontSize: 12, padding: '4px 10px', borderRadius: 9999, marginLeft: 8 }}>{lista.length}</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              {lista.map((sg, i) => {
                const sgColor = (sg.s && sg.s !== '.' && siglaColor[sg.s]) ? siglaColor[sg.s] : gc
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: isDark ? '#1E293B' : '#fff', borderRadius: 12, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}` }}>
                    <SiluetaAuto nombre={sg.n} color={sgColor} size={26} tooltip={`${sg.n}${sg.s && sg.s !== '.' ? ' · ' + sg.s : ''}${'prov' in sg && (sg as any).prov ? ' · ' + (sg as any).prov : ''}`} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {'prov' in sg && (sg as any).prov && <div style={{ fontSize: 12, fontWeight: 700, color: '#08B0A7', marginBottom: 4 }}>{(sg as any).prov}</div>}
                      <div style={{ fontSize: 15, color: isDark ? '#fff' : '#0f172a', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sg.n}</div>
                    </div>
                    {sg.s && sg.s !== '.' && <span style={{ fontSize: 12, background: `${sgColor}33`, color: ensureReadableColor(sgColor, isDark), padding: '4px 10px', borderRadius: 6, fontWeight: 700, flexShrink: 0 }}>{sg.s}</span>}
                  </div>
                )
              })}
            </div>
          </section>
        )
      })()}

      {/* Corregidores — solo Beni 2021 */}
      {anio === '2021' && (d.corregidores21 ?? []).length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.025em', color: isDark ? '#fff' : '#0f172a', marginBottom: 16 }}>
            🌿 Corregidores <span style={{ background: 'rgba(166,206,62,0.2)', color: isDark ? '#A6CE3E' : '#65a30d', fontSize: 12, padding: '4px 10px', borderRadius: 9999, marginLeft: 8 }}>{d.corregidores21.length}</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
            {d.corregidores21.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 16, background: isDark ? '#1E293B' : '#fff', borderRadius: 12, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}` }} title={`${c.n} · ${c.s}`}>
                <SiluetaAuto nombre={c.n} color={c.c || gc} size={22} tooltip={`${c.n} · ${c.s}`} />
                <span style={{ fontSize: 14, color: isDark ? '#e2e8f0' : '#334155', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{c.n}</span>
                {c.s && <span style={{ fontSize: 11, background: `${c.c || gc}33`, color: ensureReadableColor(c.c || gc, isDark), padding: '3px 8px', borderRadius: 6, fontWeight: 700, flexShrink: 0 }}>{c.s}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Secretarios de Despacho */}
      {anio === '2021' && d.secretarios21?.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.025em', color: isDark ? '#fff' : '#0f172a', marginBottom: 16 }}>
            Secretarios de Despacho <span style={{ background: 'rgba(8,176,167,0.2)', color: '#08B0A7', fontSize: 12, padding: '4px 10px', borderRadius: 9999, marginLeft: 8 }}>{d.secretarios21.length}</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            {d.secretarios21.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, background: isDark ? '#1E293B' : '#fff', padding: 20, borderRadius: 12, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', borderLeft: `4px solid ${gc}` }}>
                <SiluetaAuto nombre={s.n} color={gc} size={28} tooltip={`${s.n} · ${s.cargo}`} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, margin: 0 }}>{s.cargo}</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: isDark ? '#fff' : '#0f172a', margin: 0 }}>{s.n}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Directores */}
      {anio === '2021' && (d.directores21 ?? []).length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.025em', color: isDark ? '#fff' : '#0f172a', marginBottom: 16 }}>
            📋 Directores <span style={{ background: 'rgba(166,206,62,0.2)', color: isDark ? '#A6CE3E' : '#65a30d', fontSize: 12, padding: '4px 10px', borderRadius: 9999, marginLeft: 8 }}>{d.directores21!.length}</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            {d.directores21!.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, background: isDark ? '#1E293B' : '#fff', padding: 20, borderRadius: 12, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', borderLeft: `4px solid ${gc}` }}>
                <SiluetaAuto nombre={s.n} color={gc} size={28} tooltip={`${s.n} · ${s.cargo}`} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, margin: 0 }}>{s.cargo}</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: isDark ? '#fff' : '#0f172a', margin: 0 }}>{s.n}</p>
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
        <div style={{ flex: '0 0 42%', display: 'flex', flexDirection: 'column', background: isDark ? 'rgba(30,35,50,0.92)' : '#f8fafc', backdropFilter: isDark ? 'blur(16px)' : 'none', overflow: 'hidden', transition: 'background 0.3s' }}>
          {/* Breadcrumb */}
          <div style={{ padding: '10px 16px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`, background: isDark ? 'rgba(255,255,255,0.03)' : '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {deptoActivo && deptosData[deptoActivo] ? (
              <button onClick={() => { setVista('depto'); setMunActiva(null) }}
                style={{ fontSize: 11, fontWeight: 700, color: vista === 'depto' ? '#08B0A7' : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'), background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', transition: 'color 0.2s' }}>
                🏛️ {deptosData[deptoActivo].nombre}
              </button>
            ) : (
              <span style={{ fontSize: 11, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>Haz clic en un departamento · {anio}</span>
            )}
            {munData && (
              <><span style={{ color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)', fontSize: 12 }}>›</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#A6CE3E' : '#65a30d' }}>🏘️ {munData.nombre}</span></>
            )}
            <span style={{ marginLeft: 'auto', fontSize: 10, color: '#08B0A7', fontWeight: 700, background: 'rgba(8,176,167,0.12)', padding: '2px 8px', borderRadius: 4 }}>{anio}</span>
            <button
              onClick={() => setIsDark(prev => !prev)}
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer', padding: '3px 6px', borderRadius: 6, fontSize: 14, lineHeight: 1, transition: 'background 0.2s' }}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
          <div className={isDark ? 'dark-panel-scroll' : 'light-panel-scroll'} style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', color: isDark ? 'rgba(255,255,255,0.88)' : '#1e293b', transition: 'color 0.3s' }}>
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
  )
}