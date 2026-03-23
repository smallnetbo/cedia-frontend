// src/app/demo/mapa-hola-mundo/page.tsx
//
// IMPORTANTE: Leaflet no funciona en SSR (usa window/document).
// En Next.js App Router SIEMPRE importa los componentes de mapa
// con dynamic + { ssr: false }.
//
// Este es el patrón que debes usar en TODAS las páginas del proyecto
// que incluyan un <MapContainer>.

import dynamic from 'next/dynamic'

// Carga el componente solo en el cliente, nunca en el servidor
const MapaHolaMundo = dynamic(
  () => import('./MapaHolaMundo'),
  {
    ssr: false,
    loading: () => <p>Cargando mapa...</p>,
  }
)

export default function Page() {
  return <MapaHolaMundo />
}
