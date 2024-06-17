export interface Ficha {
  id: string
  nombre: string
  nombreCorto: string
}

export interface EntidadFicha {
  id: string
  codigoEntidad: string
  codigoDepartamento: string
  nombre: string
  nombreGam: string
  nivelGobierno: NivelGobierno
}

export interface NivelGobierno {
  id: string
  nombreCorto: string
}
