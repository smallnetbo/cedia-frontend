import { SubSector } from '../../types/datosGeneralesType'

export const filtrarVariablesRepetidas = (
  variables: SubSector['variables'],
  key: keyof SubSector['variables'][number]
) => {
  const uniqueVariables: { [key: string]: boolean } = {}
  return variables.filter((variable) => {
    const variableKey = variable[key] as string
    if (uniqueVariables[variableKey]) {
      return false
    }
    uniqueVariables[variableKey] = true
    return true
  })
}
