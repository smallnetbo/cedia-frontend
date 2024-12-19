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
    const categoryDataMap: {
      [agrupadorValor: string]: {
        nameAgrupador: string
        entidades: {
          id: string
          codigoEntidad: string
          codigoDepartamento: string
          nombre: string
          chartData: ChartData[]
        }[]
      }
    } = {}

    category.variables.forEach((variable) => {
      const items = variable.items
      const entidadVariables = variable.entidadVariables

      const agrupadorItem = items.find((item) => item.esAgrupador)

      if (agrupadorItem) {
        const agrupadorNombre = agrupadorItem.nombreCorto

        entidadVariables.forEach((entidadVariable) => {
          const entidad = entidadVariable.entidad
          const registro = entidadVariable.datoRegistro
          const agrupadorValor = registro[agrupadorNombre]

          if (agrupadorValor !== undefined) {
            if (!categoryDataMap[agrupadorValor]) {
              categoryDataMap[agrupadorValor] = {
                nameAgrupador: agrupadorValor,
                entidades: [],
              }
            }

            const entityEntry = categoryDataMap[agrupadorValor].entidades.find(
              (e) => e.id === entidad.id
            )

            if (entityEntry) {
              items.forEach((item) => {
                if (!item.esAgrupador) {
                  const value = registro[item.nombreCorto]
                  if (value !== undefined) {
                    const existingChartData = entityEntry.chartData.find(
                      (cd) =>
                        cd.nombre === item.nombre && cd.valor === Number(value)
                    )
                    if (!existingChartData) {
                      entityEntry.chartData.push({
                        nombre: item.nombre,
                        valor: value,
                        color: item.color,
                        icono: item.icono,
                      })
                    }
                  }
                }
              })
            } else {
              const newEntity = {
                id: entidad.id,
                codigoEntidad: entidad.codigoEntidad,
                codigoDepartamento: entidad.codigoDepartamento,
                nombre: entidad.nombre,
                chartData: [] as ChartData[],
              }

              items.forEach((item) => {
                if (!item.esAgrupador) {
                  const value = registro[item.nombreCorto]
                  if (value !== undefined) {
                    newEntity.chartData.push({
                      nombre: item.nombre,
                      valor: value,
                      color: item.color,
                      icono: item.icono,
                    })
                  }
                }
              })

              categoryDataMap[agrupadorValor].entidades.push(newEntity)
            }
          }
        })
      } else {
        const variableName = variable.nombre

        entidadVariables.forEach((entidadVariable) => {
          const entidad = entidadVariable.entidad
          const registro = entidadVariable.datoRegistro

          if (!categoryDataMap[variableName]) {
            categoryDataMap[variableName] = {
              nameAgrupador: variableName,
              entidades: [],
            }
          }

          const entityEntry = categoryDataMap[variableName].entidades.find(
            (e) => e.id === entidad.id
          )

          if (entityEntry) {
            items.forEach((item) => {
              if (!item.esAgrupador) {
                const value = registro[item.nombreCorto]
                if (value !== undefined) {
                  const existingChartData = entityEntry.chartData.find(
                    (cd) =>
                      cd.nombre === item.nombre && cd.valor === Number(value)
                  )
                  if (!existingChartData) {
                    entityEntry.chartData.push({
                      nombre: item.nombre,
                      valor: value,
                      color: item.color,
                      icono: item.icono,
                    })
                  }
                }
              }
            })
          } else {
            const newEntity = {
              id: entidad.id,
              codigoEntidad: entidad.codigoEntidad,
              codigoDepartamento: entidad.codigoDepartamento,
              nombre: entidad.nombre,
              chartData: [] as ChartData[],
            }

            items.forEach((item) => {
              if (!item.esAgrupador) {
                const value = registro[item.nombreCorto]
                if (value !== undefined) {
                  newEntity.chartData.push({
                    nombre: item.nombre,
                    valor: value,
                    color: item.color,
                    icono: item.icono,
                  })
                }
              }
            })

            categoryDataMap[variableName].entidades.push(newEntity)
          }
        })
      }
    })

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

    Object.values(categoryDataMap).forEach((agrupador) => {
      categoryData.push({
        nameAgrupador: agrupador.nameAgrupador,
        data: agrupador.entidades.map((entidad) => ({
          entidad: {
            id: entidad.id,
            codigoEntidad: entidad.codigoEntidad,
            codigoDepartamento: entidad.codigoDepartamento,
            nombre: entidad.nombre,
            chartData: entidad.chartData,
          },
        })),
      })
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
