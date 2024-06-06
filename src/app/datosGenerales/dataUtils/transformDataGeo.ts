import { ChartData, SubSector } from '../types/datosGeneralesType'

export const formattedDataGeo = (data: SubSector[]) => {
  const formattedChartData: {
    nameSubsector: string
    data: {
      nameAgrupador: string
      data: {
        entidad: {
          id: string
          codigoEntidad: string
          codigoDepartamento: string
          nombre: string
          chartData: ChartData[]
        }
      }[]
    }[]
  }[] = []

  data.forEach((category) => {
    const categoryData: {
      nameAgrupador: string
      data: {
        entidad: {
          id: string
          codigoEntidad: string
          codigoDepartamento: string
          nombre: string
          chartData: ChartData[]
        }
      }[]
    }[] = []

    category.variables.forEach((variable) => {
      const items = variable.items
      const entidadVariables = variable.entidadVariables

      // Verifica si hay un agrupador
      const agrupadorItem = items.find((item) => item.esAgrupador)

      if (agrupadorItem) {
        // Si hay un agrupador, agrupa los datos
        const agrupadorNombre = agrupadorItem.nombreCorto

        const agrupadorData: {
          [key: string]: {
            [key: string]: {
              entidad: {
                id: string
                codigoEntidad: string
                codigoDepartamento: string
                nombre: string
              }
              chartData: ChartData[]
            }
          }
        } = {}

        entidadVariables.forEach((entidadVariable) => {
          const entidad = entidadVariable.entidad
          const registro = entidadVariable.datoRegistro
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
                    agrupadorData[agrupadorValor] = {}
                  }

                  if (!agrupadorData[agrupadorValor][entidad.id]) {
                    agrupadorData[agrupadorValor][entidad.id] = {
                      entidad: {
                        id: entidad.id,
                        codigoEntidad: entidad.codigoEntidad,
                        codigoDepartamento: entidad.codigoDepartamento,
                        nombre: entidad.nombre,
                      },
                      chartData: [],
                    }
                  }

                  agrupadorData[agrupadorValor][entidad.id].chartData.push({
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

        // Añade datos agrupados a categoryData
        Object.entries(agrupadorData).forEach(([agrupador, entidades]) => {
          const entidadesConChartData = Object.values(entidades).map((d) => ({
            entidad: d.entidad,
            chartData: d.chartData,
          }))

          categoryData.push({
            nameAgrupador: agrupador,
            data: entidadesConChartData.map((entidadData) => ({
              entidad: {
                ...entidadData.entidad,
                chartData: entidadData.chartData,
              },
            })),
          })
        })
      } else {
        // Si no hay agrupador, procesa los datos normalmente
        const entidadDataMap: {
          [key: string]: {
            entidad: {
              id: string
              codigoEntidad: string
              codigoDepartamento: string
              nombre: string
            }
            chartData: ChartData[]
          }
        } = {}

        entidadVariables.forEach((entidadVariable) => {
          const entidad = entidadVariable.entidad
          const registro = entidadVariable.datoRegistro

          if (!entidadDataMap[entidad.id]) {
            entidadDataMap[entidad.id] = {
              entidad: {
                id: entidad.id,
                codigoEntidad: entidad.codigoEntidad,
                codigoDepartamento: entidad.codigoDepartamento,
                nombre: entidad.nombre,
              },
              chartData: [],
            }
          }

          items.forEach((item) => {
            const itemName = item.nombre
            const nombreCorto = item.nombreCorto
            const itemColor = item.color
            const itemIcono = item.icono
            const value = registro[nombreCorto]

            if (value !== undefined) {
              entidadDataMap[entidad.id].chartData.push({
                nombre: itemName,
                valor: Number(value),
                color: itemColor,
                icono: itemIcono,
              })
            }
          })
        })

        categoryData.push({
          nameAgrupador: '',
          data: Object.values(entidadDataMap).map((entidadData) => ({
            entidad: {
              ...entidadData.entidad,
              chartData: entidadData.chartData,
            },
          })),
        })
      }
    })

    if (categoryData.length > 0) {
      formattedChartData.push({
        nameSubsector: category.nombre,
        data: categoryData,
      })
    }
  })

  return formattedChartData
}
