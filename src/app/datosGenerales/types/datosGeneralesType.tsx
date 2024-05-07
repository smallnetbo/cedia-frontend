export interface SubSector {
  id: string
  nombre: string
  icono: string
  variables: Variable[]
}

export interface Variable {
  id: string
  nombre: string
  nombreCorto: string
  posicion: string
  entidadVariables: EntidadVariable[]
}

export interface EntidadVariable {
  id: string
  datoRegistro: DatoRegistro
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
