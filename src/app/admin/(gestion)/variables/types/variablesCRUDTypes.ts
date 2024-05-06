export interface SubSectorType {
    id: string
    nombre: string
    nombreCorto:string
    icono:string
  }
   export interface GraficoType {
     id: string
     titulo: string
   }
 
  export interface VariablesCRUDType {
    id: string
    estado: string
    usuarioCreacion: string
    fechaCreacion: Date
    usuarioActualizacion?: string
    fechaActualizacion: Date
    nombre: string
    nombreCorto:string
    posicion: string
  
    subsector: SubSectorType
    graficos: GraficoType
  }
  
  export interface CrearEditarVariablesType {
    id?: string
    nombre?: string
    nombreCorto:string
    posicion?: string
    idSubSector?: string
    idGrafico?: string
  }
  