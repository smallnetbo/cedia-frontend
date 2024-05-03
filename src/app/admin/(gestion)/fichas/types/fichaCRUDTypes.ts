 
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

  }
  