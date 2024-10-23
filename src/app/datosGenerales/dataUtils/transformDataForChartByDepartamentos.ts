import { SubSector, ChartData } from '../types/datosGeneralesType'
import { departamentoMap } from '../types/departamentos'

export const transformDataForChartByDepartamentos = (
  data: SubSector[],
  variableId: string,
  entidadName: string
): {
  name: string
  data: ChartData[]
}[] => {
  const aggregatedData: Record<string, Record<string, ChartData>> = {}

  data.forEach((subSector) => {
    subSector.variables.forEach((variable) => {
      if (variable.id === variableId) {
        const items = variable.items
        const entidadVariables = variable.entidadVariables

        const agrupadorItem = items.find((item) => item.esAgrupador)

        if (agrupadorItem) {
          const agrupadorNombre = agrupadorItem.nombreCorto

          entidadVariables.forEach((entidadVariable) => {
            const { datoRegistro, entidad } = entidadVariable
            const nombreDepartamento =
              departamentoMap[entidad.codigoDepartamento]
            if (nombreDepartamento === entidadName) {
              const agrupadorValor = datoRegistro[agrupadorNombre]

              if (agrupadorValor !== undefined) {
                items.forEach((item) => {
                  if (!item.esAgrupador) {
                    const itemName = item.nombre
                    const nombreCorto = item.nombreCorto
                    const itemColor = item.color
                    const itemIcono = item.icono
                    const value = datoRegistro[nombreCorto]

                    if (value !== undefined) {
                      if (!aggregatedData[agrupadorValor]) {
                        aggregatedData[agrupadorValor] = {}
                      }

                      if (!aggregatedData[agrupadorValor][itemName]) {
                        aggregatedData[agrupadorValor][itemName] = {
                          nombre: itemName,
                          valor: 0,
                          color: itemColor,
                          icono: itemIcono,
                        }
                      }

                      aggregatedData[agrupadorValor][itemName].valor += value
                    }
                  }
                })
              }
            }
          })
        } else {
          entidadVariables.forEach((entidadVariable) => {
            const { datoRegistro, entidad } = entidadVariable
            const nombreDepartamento =
              departamentoMap[entidad.codigoDepartamento]
            if (nombreDepartamento === entidadName) {
              items.forEach((item) => {
                const itemName = item.nombre
                const nombreCorto = item.nombreCorto
                const value = datoRegistro[nombreCorto]

                if (value !== undefined) {
                  if (!aggregatedData[nombreDepartamento]) {
                    aggregatedData[nombreDepartamento] = {}
                  }

                  if (!aggregatedData[nombreDepartamento][itemName]) {
                    aggregatedData[nombreDepartamento][itemName] = {
                      nombre: itemName,
                      valor: 0,
                      color: item.color,
                      icono: item.icono,
                    }
                  }

                  aggregatedData[nombreDepartamento][itemName].valor += value
                }
              })
            }
          })
        }
      }
    })
  })

  return Object.entries(aggregatedData).map(([name, data]) => ({
    name: `municipios de ${name}`,
    data: Object.values(data),
  }))
}
