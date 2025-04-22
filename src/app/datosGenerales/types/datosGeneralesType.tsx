export interface SubSector {
  id: string
  nombre: string
  icono: string
  vistasVisualizadas: Vistas
  sector: Sector
  variables: Variable[]
}

export interface Vistas {
  datosGenerales: boolean
  comparativaGGAA: boolean
  cruceDeVariables: boolean
  datosSectoriales: boolean
  georeferenciaDeVariables: boolean
}

export interface Sector {
  nombre: string
  nombreCorto: string
  colorPrimario: string
  colorSecundario: string
}
export interface Variable {
  id: string
  nombre: string
  nombreCorto: string
  posicion: string
  graficos: Graficos
  graficoPdf: GraficoPdf
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
  nombre: string
  descripcion: string
}
export interface GraficoPdf {
  id: string
  titulo: string
  ancho: string
  tipoGrafico: TipoGrafico
}

export interface Items {
  id: string
  nombre: string
  nombreCorto: string
  color: string
  icono: string
  esAgrupador: boolean
  cruceVariable?: boolean
}

export interface EntidadVariable {
  id: string
  datoRegistro: DatoRegistro
  entidad: Entidad
}
export interface DatoRegistro {
  [key: string]: string
}

export interface Entidad {
  id: string
  codigoEntidad: string
  codigoDepartamento: string
  nombre: string
  nombreGam: string
  nivelGobierno: nivelGobierno
  categoria: Categoria
}

export interface nivelGobierno {
  id: string
  nombreCorto: string
}
export interface Categoria {
  id: string
  nombre: string
}

/* nuevo json */
export interface ChartData {
  nombre: string
  valor: number | string
  color: string
  icono?: string
}
