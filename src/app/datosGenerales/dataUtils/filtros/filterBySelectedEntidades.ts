import { SubSector } from '../../types/datosGeneralesType'

export const filterBySelectedEntidades = (
  data: SubSector[],
  selectedEntidades: number[]
): SubSector[] => {
  return data.map((subSector) => {
    // Filtra las variables en cada subsector
    const filteredVariables = subSector.variables.map((variable) => {
      // Filtra las entidadVariables en cada variable
      const filteredEntidadVariables = variable.entidadVariables.filter(
        (entidadVariable) =>
          selectedEntidades.includes(
            Number(entidadVariable.entidad.codigoEntidad)
          )
      )

      // Retorna la variable con entidadVariables filtradas
      return {
        ...variable,
        entidadVariables: filteredEntidadVariables,
      }
    })

    // Retorna el subsector con variables filtradas
    return {
      ...subSector,
      variables: filteredVariables,
    }
  })
}
