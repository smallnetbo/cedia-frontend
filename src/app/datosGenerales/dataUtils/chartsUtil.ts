import { DatoRegistro, SubSector } from '../types/datosGeneralesType'

export const transformDataForChartByEntidad = (
  data: SubSector[],
  variableName: string,
  entidadName: string
): { name: string; data: { datoRegistro: DatoRegistro }[] }[] => {
  const groupedData: { [key: string]: { datoRegistro: DatoRegistro }[] } = {}

  data.forEach((subSector) => {
    subSector.variables.forEach((variable) => {
      if (variable.nombre === variableName) {
        variable.entidadVariables.forEach((entidadVariable) => {
          const { datoRegistro, entidad } = entidadVariable
          if (entidad.nombre === entidadName) {
            if (!groupedData[entidad.nombre]) {
              groupedData[entidad.nombre] = []
            }
            groupedData[entidad.nombre].push({
              datoRegistro: {
                año: datoRegistro.año,
                recurso: datoRegistro.recurso,
                ejecucion: parseFloat(datoRegistro.ejecucion).toFixed(2),
              },
            })
          }
        })
      }
    })
  })

  return Object.keys(groupedData).map((entidad) => ({
    name: entidad,
    data: groupedData[entidad],
  }))
}

// Otras funciones utilitarias relacionadas con gráficos
