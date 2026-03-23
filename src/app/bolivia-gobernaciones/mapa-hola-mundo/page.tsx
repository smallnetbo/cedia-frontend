// src/app/demo/mapa-bolivia/page.tsx
import dynamic from 'next/dynamic'

const MapaBolivia = dynamic(
  () => import('./MapaBolivia'),
  {
    ssr: false,
    loading: () => <p style={{ padding: 24 }}>Cargando mapa de Bolivia...</p>,
  }
)

export default function Page() {
  return <MapaBolivia />
}