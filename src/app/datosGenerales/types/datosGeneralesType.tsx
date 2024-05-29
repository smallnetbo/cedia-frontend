export interface SubSector {
  id: string
  nombre: string
  icono: string
  tipoDatoGeneral: boolean
  variables: Variable[]
}

export interface Variable {
  id: string
  nombre: string
  nombreCorto: string
  posicion: string
  graficos: Graficos
  entidadVariables: EntidadVariable[]
  items: Items[]
}

export interface Graficos {
  id: string
  titulo: string
  ancho: string
  tipoGrafico: TipoGrafico
}

export interface TipoGrafico {
  id: string
  descripcion: string
}

export interface Items {
  id: string
  nombre: string
  color: string
  icono: string
  esAgrupador: boolean
}

export interface EntidadVariable {
  id: string
  datoRegistro: DatoRegistro
  entidad: Entidad
}
export interface DatoRegistro {
  año: string
  recurso: string
  ejecucion: string
}

export interface Entidad {
  id: string
  codigoEntidad: string
  codigoDepartamento: string
  nombre: string
  nivelGobierno: nivelGobierno
}

export interface nivelGobierno {
  id: string
  nombreCorto: string
}

/* nuevo json */
export interface ChartData {
  nombre: string
  valor: number
  color: string
  icono: string
}
