import { DatoRegistro, SubSector, ChartData } from '../types/datosGeneralesType'

export const transformDataForChartByEntidad = (
  data: SubSector[],
  variableName: string,
  entidadName: string
): { name: string; data: { chartData: ChartData }[] }[] => {
  const formattedChartData: {
    name: string
    data: { chartData: ChartData }[]
  }[] = []

  data.forEach((subSector) => {
    subSector.variables.forEach((variable) => {
      if (variable.nombre === variableName) {
        variable.entidadVariables.forEach((entidadVariable) => {
          const { datoRegistro, entidad } = entidadVariable
          if (entidad.nombre === entidadName) {
            const formattedData: { chartData: ChartData }[] = []

            variable.items.forEach((item) => {
              const itemName = item.nombre
              const value = datoRegistro[itemName]

              if (value !== undefined) {
                const chartData: ChartData = {
                  nombre: itemName,
                  valor: Number(value),
                  color: item.color,
                  icono: item.icono,
                }

                formattedData.push({ chartData })
              }
            })

            formattedChartData.push({
              name: entidadName,
              data: formattedData,
            })
          }
        })
      }
    })
  })

  return formattedChartData
}
