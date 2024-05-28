export interface NivelGobiernoCRUDType {
  id: number
  nombre: string
  nombreCorto:string
  estado: string
}

export interface CrearEditarNivelGobiernoType {
  id?: number
  nombre?: string
}
