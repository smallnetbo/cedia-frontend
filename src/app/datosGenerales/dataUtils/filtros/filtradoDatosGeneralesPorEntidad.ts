import { EntidadesData } from '../../reporte/ui/modalReportes/ModalReporteGeoreferencia'
import { SubSector } from '../../types/datosGeneralesType'

export const filtradoDatosGeneralesPorEntidad = (
  infoEntidadData: SubSector[],
  selectedEntidades: EntidadesData[]
): any => {
  // Creamos un mapa para almacenar las categorías agrupadas por RANGE
  const categoriasMap = new Map<string, any>()

  // Iteramos sobre las entidades seleccionadas
  selectedEntidades.forEach((entidad) => {
    const nombreEntidad = entidad.nombre
    const colorEntidad = entidad.color

    // Filtramos los subSectores relacionados con la entidad
    infoEntidadData.forEach((subSector) => {
      subSector.variables.forEach((variable) => {
        variable.entidadVariables.forEach((entidadVariable) => {
          // Verificamos que la entidad en el variable coincida con la entidad seleccionada
          if (entidadVariable.entidad.nombre === nombreEntidad) {
            const range = entidadVariable.datoRegistro['RANGE'] // Asumimos que 'RANGE' es el campo que nos interesa
            const recaudacion = entidadVariable.datoRegistro['RECAUD']

            // Si la categoría (RANGE) no existe, la creamos
            if (!categoriasMap.has(range)) {
              categoriasMap.set(range, {
                titulo: range,
                color: colorEntidad,
                entidades: [],
              })
            }

            // Obtenemos la categoría actual
            const categoria = categoriasMap.get(range)

            // Verificamos si la entidad ya existe en la categoría
            let entidadExistente = categoria.entidades.find(
              (e: any) => e.nombre === nombreEntidad
            )

            if (!entidadExistente) {
              // Si no existe, la agregamos
              entidadExistente = {
                nombre: nombreEntidad,
                variables: [],
              }
              categoria.entidades.push(entidadExistente)
            }

            // Agregamos la variable a la entidad
            entidadExistente.variables.push({
              CAT: entidadVariable.datoRegistro['CAT'],
              MUN: entidadVariable.datoRegistro['MUN'],
              POB: entidadVariable.datoRegistro['POB'],
              DEPTO: entidadVariable.datoRegistro['DEPTO'],
              RANGE: range,
              RECAUD: recaudacion,
            })
          }
        })
      })
    })
  })

  // Convertimos el mapa en un array
  const categorias = Array.from(categoriasMap.values())

  // Retornamos la estructura final
  return {
    titulo: 'Informe de Gestión',
    subTitulo: 'Resumen Anual 2024',
    colorPrimario: '#2c3e50', // Color primario
    colorSecundario: '#34495e', // Color secundario
    categorias: categorias,
  }
}
