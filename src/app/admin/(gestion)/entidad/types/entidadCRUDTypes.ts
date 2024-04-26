export interface CategoriaType {
  id: string
  nombre: string
}
export interface NivelGobiernoType {
  id: string
  nombre: string
  nombreCorto: string
}
export interface TipoEntidadType {
  id: string
  nombre: string
}

export interface EntidadCRUDType {
  id: string
  estado: string
  usuarioCreacion: string
  fechaCreacion: Date
  usuarioActualizacion?: string
  fechaActualizacion: Date
  codigoEntidad: string
  codigoDepartamento: string
  nombre: string
  coordenadasGeograficas:string//number[][]
  nombreGam: string

  categoria: CategoriaType
  nivelGobierno: NivelGobiernoType
  tipoEntidad: TipoEntidadType
}

export interface CrearEditarEntidadType {
  id?: string
  codigoEntidad?: string
  codigoDepartamento?: string
  nombre?: string
  coordenadasGeograficas:string//number[][]
  nombreGam?: string
  idCategoria?: string
  idNivelGobierno?: string
  idTipoEntidad?: string
  filecoordenadas:string
}
