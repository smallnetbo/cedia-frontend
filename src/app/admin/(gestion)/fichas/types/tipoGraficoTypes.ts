export interface TipoGraficoType{
    estado: string
    usuarioCreacion: string
    fechaCreacion: Date
    usuarioActualizacion?: string
    fechaActualizacion: Date
    id:string
    descripcion:string
}

export interface GraficoTypes {
    estado: string
    usuarioCreacion: string
    fechaCreacion: Date
    usuarioActualizacion?: string
    fechaActualizacion: Date

    id: string
    titulo: string
    colorFondoTitulo?:string,
    esEliminado?:boolean
    idTipoGrafico:string
    tipoGrafico:TipoGraficoType

  }
