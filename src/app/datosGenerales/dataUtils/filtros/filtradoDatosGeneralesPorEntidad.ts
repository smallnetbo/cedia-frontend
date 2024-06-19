import { Items, SubSector } from '../../../fichasSectoriales/types/reporteType'

export const filtradoDatosGeneralesPorEntidad = (
  infoEntidadData: SubSector[]
) => {
  const datosFiltrados: { [entidad: string]: SubSector[] } = {}

  infoEntidadData.forEach((subSector) => {
    subSector.variables.forEach((variable) => {
      variable.entidadVariables.forEach((entidadVariable) => {
        const entidadNombre = entidadVariable.entidad.nombre

        if (!datosFiltrados[entidadNombre]) {
          datosFiltrados[entidadNombre] = []
        }

        // Construir los datos generales para la entidad
        const datosGenerales: SubSector = {
          id: subSector.id,
          nombre: subSector.nombre,
          icono: subSector.icono,
          sector: subSector.sector,

          variables: [
            {
              ...variable,
              entidadVariables: [entidadVariable],
              items: filtrarItems(variable.items, entidadVariable.datoRegistro),
            },
          ],
        }

        datosFiltrados[entidadNombre].push(datosGenerales)
      })
    })
  })

  return datosFiltrados
}

const filtrarItems = (
  items: Items[],
  datoRegistro: { [key: string]: string }
) => {
  return items
    .map((item) => {
      const datoItem = datoRegistro[item.nombreCorto]
      return datoItem
        ? { ...item, datoRegistro: { nombre: item.nombre, valor: datoItem } }
        : null
    })
    .filter(Boolean)
}
