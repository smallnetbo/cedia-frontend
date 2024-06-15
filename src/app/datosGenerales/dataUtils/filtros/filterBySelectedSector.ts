import { SubSector } from '../../types/datosGeneralesType'

export const filtradoDatosGeneralesPorSector = (
  infoEntidadData: SubSector[]
) => {
  const datosPorSector: { [sector: string]: SubSector[] } = {}

  infoEntidadData.forEach((element) => {
    const sectorNombre = element.sector.nombre

    if (!datosPorSector[sectorNombre]) {
      datosPorSector[sectorNombre] = []
    }

    datosPorSector[sectorNombre].push({
      id: element.id,
      nombre: element.nombre,
      icono: element.icono,
      variables: element.variables
        .map((variable) => {
          const items = variable.items
            .map((item) => {
              const entidadVariable = variable.entidadVariables.find(
                (entidad) =>
                  entidad.datoRegistro[item.nombreCorto] !== undefined
              )

              const datoRegistro = entidadVariable
                ? entidadVariable.datoRegistro[item.nombreCorto]
                : undefined

              return {
                ...item,
                datoRegistro:
                  datoRegistro !== undefined
                    ? { nombre: item.nombre, valor: datoRegistro }
                    : undefined,
              }
            })
            .filter((item) => item.datoRegistro !== undefined)

          return {
            id: variable.id,
            nombre: variable.nombre,
            nombreCorto: variable.nombreCorto,
            posicion: variable.posicion,
            items,
          }
        })
        .filter((variable) => variable.items.length > 0),
    })
  })

  return datosPorSector
}
