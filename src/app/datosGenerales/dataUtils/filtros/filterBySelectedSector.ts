import { SubSector, ChartData } from '../../types/datosGeneralesType'

export const filtradoDatosGeneralesPorSector = (
  infoEntidadData: SubSector[]
) => {
  const datosPorSector: { [sector: string]: any } = {}

  infoEntidadData.forEach((element) => {
    const sectorNombre = element.sector.nombre

    if (!datosPorSector[sectorNombre]) {
      datosPorSector[sectorNombre] = []
    }

    const variables = element.variables
      .filter((variable) => variable.graficoPdf !== null)
      .map((variable) => {
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
          const formattedData = Object.entries(agrupadorData).map(
            ([agrupador, datos]) => ({
              name: agrupador,
              data: datos,
            })
          )

          return {
            nombre: variable.nombre,
            data: formattedData,
            tipoGrafico: variable.graficoPdf.tipoGrafico.descripcion,
          }
        } else {
          // Si no hay agrupador, procesa los datos normalmente
          const formattedData = entidadVariables.flatMap((entidad) => {
            const registro = entidad.datoRegistro

            return items
              .map((item) => {
                const itemName = item.nombre
                const nombreCorto = item.nombreCorto
                const itemColor = item.color
                const itemIcono = item.icono
                const value = registro[nombreCorto]

                if (value !== undefined) {
                  return {
                    nombre: itemName,
                    valor: value,
                    color: itemColor,
                    icono: itemIcono,
                  }
                }

                return null
              })
              .filter(Boolean)
          })

          return {
            nombre: variable.nombre,
            data: [{ name: variable.nombre, data: formattedData }],
            tipoGrafico: variable.graficoPdf.tipoGrafico.descripcion,
          }
        }
      })
      .filter((variable) => variable.data.length > 0)

    datosPorSector[sectorNombre].push({
      id: element.id,
      nombre: element.nombre,
      icono: element.icono,
      variables: variables,
    })
  })

  return datosPorSector
}
