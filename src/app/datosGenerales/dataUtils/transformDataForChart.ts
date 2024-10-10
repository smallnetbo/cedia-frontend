import { ChartData, SubSector } from '../types/datosGeneralesType'

export const transformDataForChart = (
  data: SubSector | SubSector[],
  variableName: string
) => {
  const formattedData = Array.isArray(data) ? data : [data]

  const formattedChartData: {
    name: string
    data: ChartData[]
  }[] = []

  formattedData.forEach((category) => {
    category.variables.forEach((variable) => {
      if (variable.nombre === variableName) {
        const items = variable.items
        const entidadVariables = variable.entidadVariables

        // Verifica si hay un agrupador
        const agrupadorItem = items.find((item) => item.esAgrupador)

        if (agrupadorItem) {
          const agrupadorNombre = agrupadorItem.nombreCorto
          const agrupadorData: { [key: string]: ChartData[] } = {}

          entidadVariables.forEach((entidad) => {
            const registro = entidad.datoRegistro
            const agrupadorValor = registro[agrupadorNombre]

            if (agrupadorValor !== undefined) {
              items.forEach((item) => {
                if (!item.esAgrupador) {
                  const itemName = item.nombre
                  const nombreCorto = item.nombreCorto
                  const value = registro[nombreCorto]

                  if (value !== undefined) {
                    agrupadorData[agrupadorValor] =
                      agrupadorData[agrupadorValor] || []
                    agrupadorData[agrupadorValor].push({
                      nombre: itemName,
                      valor: value,
                      color: item.color,
                      icono: item.icono,
                    })
                  }
                }
              })
            }
          })

          // Añadir datos agrupados
          Object.entries(agrupadorData).forEach(([agrupador, datos]) => {
            formattedChartData.push({
              name: agrupador,
              data: datos,
            })
          })
        } else {
          // Sin agrupador: Procesar los datos normalmente
          entidadVariables.forEach((entidad) => {
            const registro = entidad.datoRegistro

            const chartDataArray: ChartData[] = items
              .filter((item) => !item.esAgrupador)
              .map((item) => {
                const value = registro[item.nombreCorto]
                return {
                  nombre: item.nombre,
                  valor: value,
                  color: item.color,
                  icono: item.icono,
                }
              })
              .filter((data) => data.valor !== undefined)

            if (chartDataArray.length > 0) {
              formattedChartData.push({
                name: category.nombre,
                data: chartDataArray,
              })
            }
          })
        }
      }
    })
  })

  return formattedChartData
}
