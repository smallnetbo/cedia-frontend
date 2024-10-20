import { SubSector } from '../types/datosGeneralesType'

export type GraficosPorVariable = {
  [variable: string]: string
}

export const calcularGraficosPorVariable = (
  filteredInfoSectorData: SubSector[],
  filterFunction: (variables: any[]) => any[] = (variables) => variables
): GraficosPorVariable => {
  return filteredInfoSectorData.reduce(
    (acumulador: GraficosPorVariable, subSector) => {
      filterFunction(subSector.variables).forEach((variable) => {
        acumulador[variable.id] = variable.graficos.tipoGrafico.descripcion
      })
      return acumulador
    },
    {}
  )
}

export const obtenerNombreVariablePorId = (
  id: string,
  filteredInfoSectorData: SubSector[]
): string => {
  for (const sector of filteredInfoSectorData) {
    const variable = sector.variables.find((v) => v.id === id)
    if (variable) {
      return variable.nombre
    }
  }
  return ''
}
