import { optionType } from '@/components/form'
export interface SectorType {
  id: string
  nombre: string
  nombreCorto: string
  codigoSector: string
}
export interface GraficosVarType {
  id: string
  titulo: string
  colorFondoTitulo: string
  ancho: string
  idTipoGrafico: string
  idTipoGraficoPdf: string
  estado: string
  esEliminado: boolean
  fechaCreacion: Date
  fechaModificacion: Date
  usuarioCreacion: string
}
export interface VariablesType {
  id: string
  estado: string
  usuarioCreacion: string
  fechaCreacion: Date
  usuarioActualizacion?: string
  fechaActualizacion: Date
  nombre: string
  nombreCorto: string
  posicion: string
  esEliminado: boolean
  idSubSector: string // subsector: SubSectorType
  idGrafico: string // GraficoType
  idGraficoPdf: string
  items: ItemsType[]
  graficos: GraficosVarType
}

export interface ItemsType {
  id: string
  estado: string
  usuarioCreacion: string
  fechaCreacion: Date
  usuarioModicficacion?: string
  fechaModificacion: Date
  nombre: string
  nombreCorto: string
  color: string
  icono: string
  posicion: string
  esEliminado: boolean
  esAgrupador: boolean
  idVariable: string
  idTipoDato: string
}

export interface SubSectorCRUDType {
  id: string
  estado: string
  usuarioCreacion: string
  fechaCreacion: Date
  usuarioActualizacion?: string
  fechaActualizacion: Date
  nombre: string
  nombreCorto: string
  codigoSubSector: string
  icono: string
  // tipoDatoGeneral?:boolean
  vistasVisualizadas: {
    datosGenerales: boolean
    datosSectoriales: boolean
    comparativaGGAA: boolean
    cruceDeVariables: boolean
    georeferenciaDeVariables: boolean
  }
  sector: SectorType
  variables: VariablesType[]
  //grafico: GraficoType
  // tipoEntidad: TipoEntidadType
}

export interface CrearEditarSubSectorType {
  id?: string
  nombre?: string
  nombreCorto: string
  codigoSubSector: string
  icono?: optionType
  // tipoDatoGeneral?:boolean
  vistasVisualizadas: {
    datosGenerales: boolean
    datosSectoriales: boolean
    comparativaGGAA: boolean
    cruceDeVariables: boolean
    georeferenciaDeVariables: boolean
  }
  idSector?: string
  //idGrafico?: string
}

export interface VistasVIsualizadas {
  datosGenerales: boolean
  datosSectoriales: boolean
  comparativaGGAA: boolean
  cruceDeVariables: boolean
  georeferenciaDeVariables: boolean
}
export interface GuardarSubSectorType {
  id?: string
  nombre?: string
  nombreCorto: string
  codigoSubSector: string
  icono?: string
  // tipoDatoGeneral?:boolean
  vistasVisualizadas: VistasVIsualizadas
  idSector?: string
}
