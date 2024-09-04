import { validarDato } from './tipoDatoValidaCarga'

export const extraerNombresDeColumnas = (sheet: any): string[] => {
  const columnKeys = Object.keys(sheet)
  return columnKeys
    .filter((key) => key.match(/\w+1$/))
    .map((key) => sheet[key].v.toString().trim().toUpperCase())
}

export const procesarFilasDelExcel = (
  excelRows: any[][],
  extractedColumnNames: string[]
) => {
  return excelRows.slice(1).map((row: any[]) => {
    const processedRow: { [key: string]: any } = {}
    extractedColumnNames.forEach((colName, index) => {
      processedRow[colName] = row[index]
    })
    return processedRow
  })
}

export const filtrarFilasValidas = (rows: any[]) => {
  return rows.filter(
    (row) => row.ENTIDAD !== undefined && row.ENTIDAD.toString().trim() !== ''
  )
}

export const validarColumnasNoEncontradas = (
  extractedColumnNames: string[],
  itemsDataEnMinusculas: any[]
): string[] => {
  const columnasValidas = extractedColumnNames.filter(
    (colName) => colName !== 'ENTIDAD'
  )
  return columnasValidas.filter(
    (colName) =>
      !itemsDataEnMinusculas.some(
        (item) => item.nombreCorto.toUpperCase() === colName
      )
  )
}

export const validarFilasExcel = (filas: any[], itemsData: any[]): string[] => {
  const errores: string[] = []

  filas.forEach((fila, index) => {
    itemsData.forEach((item) => {
      const valor = fila[item.nombreCorto]
      const tipoDeDato = item.tipoDato
      const tipoDeDatoDescripcion = item.tipoDatoDescripcion
      const error = validarDato(valor, tipoDeDato, tipoDeDatoDescripcion)

      if (error) {
        errores.push(`Fila ${index + 1}, Columna ${item.nombreCorto}: ${error}`)
      }
    })
  })

  return errores
}

export const validarExtensionArchivo = (
  filename: string,
  allowedExtensions: string[]
): boolean => {
  const fileExtension = filename.toLowerCase()
  const regex = new RegExp(
    `^([a-zA-Z0-9\\s_\\.\-:])+((${allowedExtensions.join('|')})$)`
  )
  return regex.test(fileExtension)
}
