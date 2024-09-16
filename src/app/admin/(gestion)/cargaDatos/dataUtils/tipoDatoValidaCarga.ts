import { TipoDatoType } from '../../items/types/tipoDatoTypes'

export const obtenerTipoDeDatoPorId = (
  id: string,
  tipoDatos: TipoDatoType[]
): { nombre: string; descripcion: string } => {
  const tipoDatoEncontrado = tipoDatos.find((td) => td.id === id)
  return tipoDatoEncontrado
    ? {
        nombre: tipoDatoEncontrado.nombre,
        descripcion: tipoDatoEncontrado.descripcion,
      }
    : { nombre: 'unknown', descripcion: 'unknown' }
}

export const validarDato = (
  valor: any,
  tipoDeDato: string,
  descripcionTipoDeDato: string
): string | null => {
  switch (tipoDeDato) {
    case 'integer':
      return /^\d+$/.test(valor.toString()) && Number.isInteger(Number(valor))
        ? null
        : `Valor no válido para tipo '${descripcionTipoDeDato}': ${valor}`
    case 'varchar':
      return /^[a-zA-Z0-9\s]+$/.test(valor.toString())
        ? null
        : `Valor no válido para tipo '${descripcionTipoDeDato}': ${valor}`
    case 'date':
      const date = new Date(valor)
      return !isNaN(date.getTime())
        ? null
        : `Valor no válido para tipo '${descripcionTipoDeDato}': ${valor}`
    case 'timestamp':
      const timestamp = new Date(valor)
      return !isNaN(timestamp.getTime())
        ? null
        : `Valor no válido para tipo '${descripcionTipoDeDato}': ${valor}`
    case 'float':
      return !isNaN(parseFloat(valor)) && isFinite(Number(valor))
        ? null
        : `Valor no válido para tipo '${descripcionTipoDeDato}': ${valor}`
    default:
      return `Tipo de dato desconocido: ${tipoDeDato}`
  }
}
