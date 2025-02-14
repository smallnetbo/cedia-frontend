interface Item {
  id: string
  nombre: string
  color: string
  icono: string
  esAgrupador: boolean
}

interface Variable {
  id: string
  nombre: string
  items: Item[]
  subsector: Subsector
}

interface DatoRegistro {
  año: string
  recurso: string
  ejecucion: string
}

interface EntidadVariable {
  id: string
  datoRegistro: DatoRegistro
  variables: Variable
}

interface Entidad {
  id: string
  codigoEntidad: string
  nombre: string
  entidadVariables: EntidadVariable[]
}

interface dataGeoreferencia {
  id: string
  nombre: string
  nombreCorto: string
  entidades: Entidad[]
}

interface Subsector {
  id: string
  nombre: string
  sector: Sector
}

interface Sector {
  id: string
  nombre: string
}
