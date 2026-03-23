// src/app/demo/mapa-elecciones/page.tsx
import dynamic from 'next/dynamic'

const MapaEleccionesCompleto = dynamic(
  () => import('./MapaEleccionesCompleto'),
  {
    ssr: false,
    loading: () => (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui', color: '#888' }}>
        Cargando…
      </div>
    ),
  }
)

export default function Page() {
  return <MapaEleccionesCompleto />
}