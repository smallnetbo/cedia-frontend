declare module 'leaflet-image' {
  import { Map } from 'leaflet'
  export default function leafletImage(
    map: Map,
    callback: (error: any, canvas: HTMLCanvasElement) => void
  ): void
}
