export interface SubSector {
  id: string
  nombre: string
  icono: string
  variables: Variable[]
}

export interface Variable {
  id: string
  nombre: string
  unidadMedida: string
  nombreCorto: string
  color: string
  icono: string
  tipoVariable: string
  posicion: string
  datosVariables: DatosVariable
}

export interface DatosVariable {
  id: string
  valor: string
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
