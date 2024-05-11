 
  export interface FichaCRUDType {
    id: string
    estado: string
    usuarioCreacion: string
    fechaCreacion: Date
    usuarioActualizacion?: string
    fechaActualizacion: Date
    codigoSector: string
    nombre: string
    nombreCorto: string
    tipoSector:string//number[][]
    colorPrimario: string
  
    fechaInicio: string
    fechaFin: string
    colorSecundario:string

  }
  
  export interface CrearEditarFichaType {
    id?: string
    codigoSector?: string
    nombre?: string
    nombreCorto?: string
    tipoSector?:string
    colorPrimario?: string
    fechaInicio?: string
    fechaFin?: string
    colorSecundario?: string
    /*Campos para la carga en devolucion de bd */
     esEliminado?:boolean
     estado?:string
     fechaCreacion?:string
     fechaModificacion?:string
     transaccion?:string
     usuarioCreacion?:string
     usuarioModificacion?:string

  }
  