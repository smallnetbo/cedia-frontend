export interface VariablesType {
    id: string
    nombre: string
    nombreCorto:string
    posicion:string
  }

  export interface ItemsCRUDType {
    id: string
    estado: string
    usuarioCreacion: string
    fechaCreacion: Date
    usuarioActualizacion?: string
    fechaActualizacion: Date
    nombre: string
    color:string
    icono: string
    posicion: string
    esAgrupador:boolean
    variables: VariablesType
  }
  
  export interface CrearEditarItemsType {
    id?: string
    nombre?: string
    color:string
    icono?: string
    posicion?: string
    esAgrupador?:boolean
    idVariable?: string
  }
  