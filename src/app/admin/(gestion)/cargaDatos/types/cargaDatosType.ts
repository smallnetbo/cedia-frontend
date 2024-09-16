export interface FichaType {
  id: string
  estado: string
  codigoSector: string
  nombre: string
  nombreCorto: string
  tipoSector: string
  colorPrimario: string
  fechaInicio: string
  fechaFin: string
  colorSecundario: string
}
export interface SubSectorType {
  id: string
  estado: string
  nombre: string
  nombreCorto: string
  icono: string
  idSector: string
}
export interface VariablesType {
  id: string
  estado: string
  nombre: string
  nombreCorto: string
}

export interface ItemsType {
  id: string
  estado: string
  nombre: string
  nombreCorto: string
  esAgrupador: boolean
  idTipoDato: string
}
export interface CrearEditarFichaType {
  id?: string
  codigoSector?: string
  nombre?: string
  nombreCorto?: string
  tipoSector?: string
  colorPrimario?: string
  fechaInicio?: string
  fechaFin?: string
  colorSecundario?: string
  /*Campos para la carga en devolucion de bd */
  esEliminado?: boolean
  estado?: string
  fechaCreacion?: string
  fechaModificacion?: string
  transaccion?: string
  usuarioCreacion?: string
  usuarioModificacion?: string
}

interface DynamicObject {
  [key: string]: any
}
export interface GuardarEntidadVariable {
  id?: string
  datoRegistro?: Record<string, any>
  idEntidad: string
  idVariable: string
  datosJson: DynamicObject[]
  simular: boolean
}
export interface EntidadVariableType {
  id?: string
  datoRegistro?: Record<string, any>
  estado?: string
  idEntidad?: string
  idVariable?: string
  transaccion?: string
  usuarioCreacion?: string
  usuarioModificacion?: string
  fechaCreacion: string
  fechaModificacion?: Date
  esEliminado: boolean
}

export interface EntidadNoEnExcelType {
  id?: string
  codigoEntidad?: string
  nombre?: string
}
