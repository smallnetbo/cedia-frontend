import { optionType } from '@/components/form'
export interface VariablesType {
  id: string
  nombre: string
  nombreCorto: string
  posicion: string
}

export interface ItemsCRUDType {
  id: string
  estado: string
  usuarioCreacion: string
  fechaCreacion: Date
  usuarioActualizacion?: string
  fechaActualizacion: Date
  nombre: string
  color: string
  icono: string
  posicion: string
  esAgrupador: boolean
  variables: VariablesType
}

export interface CrearEditarItemsType {
  id?: string
  nombre?: string
  nombreCorto?: string
  color: string
  iconovista?: optionType
  icono?: optionType
  posicion?: string
  esAgrupador?: boolean
  cruceVariable?: boolean
  idVariable?: string
  idTipoDato?: string
}

export interface GuardarItemsType {
  id?: string
  nombre?: string
  nombreCorto?: string
  color: string
  icono?: string
  posicion?: string
  esAgrupador?: boolean
  cruceVariable?: boolean
  idVariable?: string
  idTipoDato?: string
}
