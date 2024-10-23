import { ChartData, SubSector } from '../types/datosGeneralesType'

export const transformDataForChart = (
  data: SubSector | SubSector[],
  variableId: string
) => {
  const formattedData = Array.isArray(data) ? data : [data]

  const formattedChartData: {
    name: string
    data: ChartData[]
  }[] = []

  formattedData.forEach((category) => {
    category.variables.forEach((variable) => {
      if (variable.id === variableId) {
        const items = variable.items
        const entidadVariables = variable.entidadVariables

        // Verifica si hay un agrupador
        const agrupadorItem = items.find((item) => item.esAgrupador)

        if (agrupadorItem) {
          // Si hay un agrupador, agrupa los datos
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
                  const itemColor = item.color
                  const itemIcono = item.icono
                  const value = registro[nombreCorto]

                  if (value !== undefined) {
                    if (!agrupadorData[agrupadorValor]) {
                      agrupadorData[agrupadorValor] = []
                    }

                    agrupadorData[agrupadorValor].push({
                      nombre: `${itemName}`,
                      valor: value,
                      color: itemColor,
                      icono: itemIcono,
                    })
                  }
                }
              })
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
          entidadVariables.forEach((entidad) => {
            const registro = entidad.datoRegistro

            items.forEach((item) => {
              const itemName = item.nombre
              const nombreCorto = item.nombreCorto
              const itemColor = item.color
              const itemIcono = item.icono
              const value = registro[nombreCorto]

              if (value !== undefined) {
                formattedChartData.push({
                  name: itemName,
                  data: [
                    {
                      nombre: `${itemName}`,
                      valor: value,
                      color: itemColor,
                      icono: itemIcono,
                    },
                  ],
                })
              }
            })
          })
        }
      }
    })
  })

  return formattedChartData
}
