export interface SectorType {
    id: string
    nombre: string
    nombreCorto:string
    codigoSector:string
  }
  // export interface GraficoType {
  //   id: string
  //   titulo: string
  // }
 
  export interface SubSectorCRUDType {
    id: string
    estado: string
    usuarioCreacion: string
    fechaCreacion: Date
    usuarioActualizacion?: string
    fechaActualizacion: Date
    nombre: string
    nombreCorto:string
    icono: string
  
    sector: SectorType
    //grafico: GraficoType
   // tipoEntidad: TipoEntidadType
  }
  
  export interface CrearEditarSubSectorType {
    id?: string
    nombre?: string
    nombreCorto:string
    icono?: string
    idSector?: string
    //idGrafico?: string
  }
  