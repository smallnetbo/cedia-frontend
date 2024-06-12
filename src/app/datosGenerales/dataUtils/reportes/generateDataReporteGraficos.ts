import { SubSector } from '../../types/datosGeneralesType'

export const generarDataReporteGraficos = (
  filteredInfoSectorData: SubSector[],
  switchStates: { [key: string]: boolean }
) => {
  return filteredInfoSectorData
    .map((element) => ({
      id: element.id,
      nombre: element.nombre,
      icono: element.icono,
      variables: element.variables
        .filter((variable) => switchStates[variable.nombre])
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
            ...variable,
            items,
          }
        })
        .filter((variable) => variable.items.length > 0),
    }))
    .filter((element) => element.variables.length > 0)
}
