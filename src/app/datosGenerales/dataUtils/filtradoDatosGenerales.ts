import { SubSector } from '../types/datosGeneralesType'

export const filtradoDatosGenerales = (infoEntidadData: SubSector[]) => {
  return (
    infoEntidadData
      //.filter((element) => element.tipoDatoGeneral === true)
      .map((element) => ({
        id: element.id,
        nombre: element.nombre,
        icono: element.icono,
        variables: element.variables
          .map((variable) => {
            const items = variable.items
              .map((item) => {
                const entidadVariable = variable.entidadVariables.find(
                  (entidad) =>
                    entidad.datoRegistro[item.nombreCorto.toLowerCase()] !==
                    undefined
                )

                const datoRegistro = entidadVariable
                  ? entidadVariable.datoRegistro[item.nombreCorto.toLowerCase()]
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
      }))
      .filter((element) => element.variables.length > 0)
  )
}
