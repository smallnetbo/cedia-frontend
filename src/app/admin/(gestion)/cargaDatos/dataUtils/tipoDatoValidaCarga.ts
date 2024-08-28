const tiposDeDatos: { [key: string]: string } = {
  '1': 'integer',
  '2': 'varchar',
  '3': 'date',
  '4': 'timestamp',
  '5': 'float',
}

export const obtenerTipoDeDatoPorId = (id: string) =>
  tiposDeDatos[id] || 'unknown'

export const validarDato = (valor: any, tipoDeDato: string): string | null => {
  switch (tipoDeDato) {
    case 'integer':
      return /^\d+$/.test(valor.toString()) && Number.isInteger(Number(valor))
        ? null
        : `Valor no válido para tipo 'integer': ${valor}`
    case 'varchar':
      return /^[a-zA-Z0-9]+$/.test(valor.toString())
        ? null
        : `Valor no válido para tipo 'varchar': ${valor}`
    case 'date':
      const date = new Date(valor)
      return !isNaN(date.getTime())
        ? null
        : `Valor no válido para tipo 'date': ${valor}`
    case 'timestamp':
      const timestamp = new Date(valor)
      return !isNaN(timestamp.getTime())
        ? null
        : `Valor no válido para tipo 'timestamp': ${valor}`
    case 'float':
      return !isNaN(parseFloat(valor)) && isFinite(Number(valor))
        ? null
        : `Valor no válido para tipo 'float': ${valor}`
    default:
      return `Tipo de dato desconocido: ${tipoDeDato}`
  }
}
