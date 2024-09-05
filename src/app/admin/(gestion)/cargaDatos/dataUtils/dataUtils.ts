import * as XLSX from 'xlsx'

export const downloadExcel = (
  jsonFormateadoDowloadExcel: any[],
  nombreVariable?: string
) => {
  const worksheet = XLSX.utils.json_to_sheet(jsonFormateadoDowloadExcel)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Hoja1')

  const nombreArchivo = `${nombreVariable || 'DatosCargados'}.xlsx`
  XLSX.writeFile(workbook, nombreArchivo)
}

export const downloadExcelPlantilla = (
  columnasplantillaExcel: any[],
  nombreVariable?: string
) => {
  const worksheet = XLSX.utils.aoa_to_sheet([columnasplantillaExcel])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Hoja1')

  const nombreArchivo = `${nombreVariable || 'Plantilla'}.xlsx`
  XLSX.writeFile(workbook, nombreArchivo)
}

export const readFileAsArrayBuffer = (
  file: File,
  onLoad: (arrayBuffer: ArrayBuffer) => void,
  onError: (error: Event | Error) => void
) => {
  if (typeof FileReader !== 'undefined') {
    const reader = new FileReader()
    reader.onload = () => onLoad(reader.result as ArrayBuffer)
    reader.onerror = (event) => onError(event)
    reader.readAsArrayBuffer(file)
  } else {
    onError(new Error('El navegador no soporta la lectura de archivos.'))
  }
}
