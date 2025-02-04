import { SubSector } from '../types/datosGeneralesType'

export const transformDataForCruceVariable = (
  data: SubSector | SubSector[],
  itemsId: string
) => {
  const formattedData = Array.isArray(data) ? data : [data]

  const result: {
    subsector: string
    departamentos: {
      name: string
      data: {
        nombre: string
        valor: number | string
        color: string
      }[]
    }[]
  }[] = []

  formattedData.forEach((subsector) => {
    const subsectorData: {
      subsector: string
      departamentos: {
        name: string
        data: {
          nombre: string
          valor: number | string
          color: string
        }[]
      }[]
    } = {
      subsector: subsector.nombre,
      departamentos: [],
    }

    subsector.variables.forEach((variable) => {
      variable.items.forEach((item) => {
        if (item.id === itemsId) {
          variable.entidadVariables.forEach((entidadVariable) => {
            const departamentoName = entidadVariable.entidad.nombre

            let departamentoData = subsectorData.departamentos.find(
              (d) => d.name === departamentoName
            )

            if (!departamentoData) {
              departamentoData = {
                name: departamentoName,
                data: [],
              }
              subsectorData.departamentos.push(departamentoData)
            }

            const registro = entidadVariable.datoRegistro
            const nombreCorto = item.nombreCorto
            const value = registro[nombreCorto]

            if (value !== undefined) {
              departamentoData.data.push({
                nombre: item.nombre,
                valor: value,
                color: item.color,
              })
            }
          })
        }
      })
    })

    if (subsectorData.departamentos.length > 0) {
      result.push(subsectorData)
    }
  })

  return result
}
