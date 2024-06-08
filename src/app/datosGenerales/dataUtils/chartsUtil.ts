import { SubSector, ChartData } from '../types/datosGeneralesType'

export const transformDataForChartByEntidad = (
  data: SubSector[],
  variableName: string,
  entidadName: string
) => {
  const formattedChartData: {
    name: string
    data: ChartData[]
  }[] = []

  data.forEach((subSector) => {
    subSector.variables.forEach((variable) => {
      if (variable.nombre === variableName) {
        const items = variable.items
        const entidadVariables = variable.entidadVariables

        // Verifica si hay un agrupador
        const agrupadorItem = items.find((item) => item.esAgrupador)

        if (agrupadorItem) {
          // Si hay un agrupador, agrupa los datos
          const agrupadorNombre = agrupadorItem.nombreCorto
          const agrupadorData: { [key: string]: ChartData[] } = {}

          entidadVariables.forEach((entidadVariable) => {
            const { datoRegistro, entidad } = entidadVariable
            if (entidad.nombre === entidadName) {
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
                      if (!agrupadorData[agrupadorValor]) {
                        agrupadorData[agrupadorValor] = []
                      }

                      agrupadorData[agrupadorValor].push({
                        nombre: itemName,
                        valor: Number(value),
                        color: itemColor,
                        icono: itemIcono,
                      })
                    }
                  }
                })
              }
            }
          })

          // Formatea los datos agrupados
          Object.entries(agrupadorData).forEach(([agrupador, datos]) => {
            formattedChartData.push({
              name: agrupador,
              data: datos,
            })
          })
        } else {
          // Si no hay agrupador, procesa los datos normalmente
          entidadVariables.forEach((entidadVariable) => {
            const { datoRegistro, entidad } = entidadVariable
            if (entidad.nombre === entidadName) {
              const formattedData: ChartData[] = []

              items.forEach((item) => {
                const itemName = item.nombreCorto
                const value = datoRegistro[itemName]

                if (value !== undefined) {
                  const chartData: ChartData = {
                    nombre: item.nombre,
                    valor: Number(value),
                    color: item.color,
                    icono: item.icono,
                  }

                  formattedData.push(chartData)
                }
              })

              formattedChartData.push({
                name: entidadName,
                data: formattedData,
              })
            }
          })
        }
      }
    })
  })

  return formattedChartData
}
