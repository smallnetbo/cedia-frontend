export interface EntidadCRUDType {
  id: number
  nombre: string
  categoria: string
}

export interface CrearEditarEntidadType {
  id?: number
  nombre?: string
  categoria?: string
}
