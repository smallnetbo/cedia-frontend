export type tipoGobierno = 'GAD' | 'GAR' | 'GAM' | 'GAIOC'

export interface Gobiernos {
  id: tipoGobierno
  name: string
}
export const gobiernos: Gobiernos[] = [
  { id: 'GAD', name: 'Departamental' },
  { id: 'GAM', name: 'Municipal' },
  { id: 'GAR', name: 'Regional' },
  { id: 'GAIOC', name: 'GAIOC' },
]

export interface Entidad {
  id: string
  codigoEntidad: string
  codigoDepartamento: string
  nombre: string
  coordenadasGeograficas: string
  nombreGam: string
  categoria: Categoria
  nivelGobierno: NivelGobierno
  tipoEntidad: TipoEntidad
}

export interface Categoria {
  id: string
  nombre: string
}
export interface NivelGobierno {
  id: string
  nombre: string
  nombre_corto: string
}
export interface TipoEntidad {
  id: string
  nombre: string
}
