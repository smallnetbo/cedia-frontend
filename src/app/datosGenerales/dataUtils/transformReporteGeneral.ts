import { ChartData, SubSector } from '@/app/fichasSectoriales/types/reporteType'

const transformDataGeneral = (data: SubSector[]) => {
  const formattedChartData: { [key: string]: ChartData[] } = {}

  data.forEach((subSector) => {
    subSector.variables.forEach((variable) => {
      const items = variable.items
      const entidadVariables = variable.entidadVariables

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
                const itemColor = item.color
                const itemIcono = item.icono
                const value = registro[nombreCorto]

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
        })

        Object.entries(agrupadorData).forEach(([agrupador, datos]) => {
          if (!formattedChartData[agrupador]) {
            formattedChartData[agrupador] = []
          }
          formattedChartData[agrupador].push(...datos)
        })
      } else {
        entidadVariables.forEach((entidad) => {
          const registro = entidad.datoRegistro

          items.forEach((item) => {
            const itemName = item.nombre
            const nombreCorto = item.nombreCorto
            const itemColor = item.color
            const itemIcono = item.icono
            const value = registro[nombreCorto]

            if (value !== undefined) {
              if (!formattedChartData[itemName]) {
                formattedChartData[itemName] = []
              }

              formattedChartData[itemName].push({
                nombre: itemName,
                valor: Number(value),
                color: itemColor,
                icono: itemIcono,
              })
            }
          })
        })
      }
    })
  })

  return formattedChartData
}

export default transformDataGeneral
