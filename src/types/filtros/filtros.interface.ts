export type filtroGobierno =
  | 'DOSGOB'
  | 'TODOGAD'
  | 'MUNICAT'
  | 'MUNIDPTO'
  | 'TODOGAIOC'

export interface FiltroGobiernos {
  id: filtroGobierno
  name: string
}
export const filtrado: FiltroGobiernos[] = [
  { id: 'DOSGOB', name: 'Entre 2 Gobiernos' },
  { id: 'TODOGAD', name: 'Entre Todos Los GADs' },
  {
    id: 'MUNICAT',
    name: 'Entre municipios agrupados según categoría municipal',
  },
  { id: 'MUNIDPTO', name: 'Entre municipios agrupados por departamento' },
  { id: 'TODOGAIOC', name: 'Entre todos los GAIOCs' },
]
