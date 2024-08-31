import { SubSector } from '../types/datosGeneralesType'

export const findDatoRegistroValor = (
  variableId: string,
  nombreCorto: string,
  section: SubSector[]
): string | number | undefined => {
  const subSector = section.find((section) =>
    section.variables.some((variable) => variable.id === variableId)
  )
  if (!subSector) return undefined

  const variable = subSector.variables.find(
    (variable) => variable.id === variableId
  )
  if (!variable) return undefined

  const entidadVariable = variable.entidadVariables.find(
    (entidad) =>
      entidad.datoRegistro && entidad.datoRegistro[nombreCorto] !== undefined
  )
  if (!entidadVariable || !entidadVariable.datoRegistro) return undefined

  return entidadVariable.datoRegistro[nombreCorto]
}
