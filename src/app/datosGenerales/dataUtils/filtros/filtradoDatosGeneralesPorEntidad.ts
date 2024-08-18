import { Items, SubSector, Variable } from '../../types/datosGeneralesType'

export const filtradoDatosGeneralesPorEntidad = (
  infoEntidadData: SubSector[]
): { [entidad: string]: SubSector[] } => {
  const datosFiltrados: { [entidad: string]: SubSector[] } = {}

  infoEntidadData.forEach((subSector) => {
    subSector.variables.forEach((variable) => {
      variable.entidadVariables.forEach((entidadVariable) => {
        const entidadNombre = entidadVariable.entidad.nombre

        if (!datosFiltrados[entidadNombre]) {
          datosFiltrados[entidadNombre] = []
        }

        // Filtrar items de la variable actual
        const filteredItems: Items[] = variable.items
          .map((item) => {
            const datoRegistro = entidadVariable.datoRegistro[item.nombreCorto]
            return datoRegistro !== undefined
              ? {
                  ...item,
                  datoRegistro: { nombre: item.nombre, valor: datoRegistro },
                }
              : null
          })
          .filter((item) => item !== null) as Items[]

        // Crear una nueva variable con los items filtrados
        const filteredVariable: Variable = {
          id: variable.id,
          nombre: variable.nombre,
          nombreCorto: variable.nombreCorto,
          posicion: variable.posicion,
          graficos: variable.graficos,
          graficoPdf: variable.graficoPdf,
          entidadVariables: [entidadVariable],
          items: filteredItems,
        }

        // Verificar si ya existe el subsector para la entidad, si no, se agrega
        const existingSubSector = datosFiltrados[entidadNombre].find(
          (subSector) => subSector.id === subSector.id
        )

        if (existingSubSector) {
          const existingVariable = existingSubSector.variables.find(
            (varItem) => varItem.id === variable.id
          )

          if (existingVariable) {
            existingVariable.items.push(...filteredItems)
          } else {
            existingSubSector.variables.push(filteredVariable)
          }
        } else {
          const newSubSector: SubSector = {
            id: subSector.id,
            nombre: subSector.nombre,
            icono: subSector.icono,
            vistasVisualizadas: subSector.vistasVisualizadas,
            sector: subSector.sector,
            variables: [filteredVariable],
          }
          datosFiltrados[entidadNombre].push(newSubSector)
        }
      })
    })
  })

  return datosFiltrados
}
