export type EntidadHandlers = {
  entidad_general: (value: string, uniqueId: string) => Promise<void>
  entidad_sectorial: (value: string, uniqueId: string) => Promise<void>
  entidad_comparativa_primero: (
    value: string,
    uniqueId: string
  ) => Promise<void>
  entidad_comparativa_segundo: (value: string) => Promise<void>
  //entidad_cruce: (value: string, uniqueId: string) => Promise<void>
}

export type SectorHandlers = {
  sector_sectorial: (value: string, uniqueId: string) => Promise<void>
  sector_comparativa: (value: string, uniqueId: string) => Promise<void>
  sector_georeferencia: (value: string, uniqueId: string) => Promise<void>
  sector_cruce_primero: (value: string, uniqueId: string) => Promise<void>
  sector_cruce_segundo: (value: string, uniqueId: string) => Promise<void>
  sector_comparativa_filtro: (value: string, uniqueId: string) => Promise<void>
  sector_comparativa_categoria: (
    value: string,
    uniqueId: string
  ) => Promise<void>
}

export type Handlers = {
  entidad: EntidadHandlers
  sector: SectorHandlers
}
