import { SubSector } from '../types/datosGeneralesType'
import { departamentoMap } from '../types/departamentos'

export const extractUniqueEntidades = (data: SubSector[]): string[] => {
  const uniqueEntidades: Set<string> = new Set()
  data.forEach((sector) => {
    sector.variables.forEach((variable) => {
      variable.entidadVariables.forEach((entidadVariable) => {
        uniqueEntidades.add(entidadVariable.entidad.nombre)
      })
    })
  })
  return Array.from(uniqueEntidades)
}

export const extractUniqueCategorias = (data: SubSector[]): string[] => {
  const uniqueCategorias = new Set<string>()
  data.forEach((sector) =>
    sector.variables.forEach((variable) =>
      variable.entidadVariables.forEach(
        (entidadVariable) =>
          entidadVariable.entidad.categoria.nombre &&
          uniqueCategorias.add(entidadVariable.entidad.categoria.nombre)
      )
    )
  )
  return Array.from(uniqueCategorias)
}

export const extractUniqueDepartamentos = (data: SubSector[]): string[] => {
  const uniqueDepartamentos = new Set<string>()

  data.forEach((sector) =>
    sector.variables.forEach((variable) =>
      variable.entidadVariables.forEach((entidadVariable) => {
        const codigoDepartamento = entidadVariable.entidad.codigoDepartamento
        if (codigoDepartamento) {
          const nombreDepartamento = departamentoMap[codigoDepartamento]
          if (nombreDepartamento) {
            uniqueDepartamentos.add(nombreDepartamento)
          }
        }
      })
    )
  )

  return Array.from(uniqueDepartamentos)
}
