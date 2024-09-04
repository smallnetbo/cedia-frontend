import XLSX from 'xlsx'

export const downloadExcel = (
  jsonFormateadoDowloadExcel: any[],
  writeFile: any
) => {
  const worksheet = XLSX.utils.json_to_sheet(jsonFormateadoDowloadExcel)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Hoja1')
  writeFile(workbook, 'DatosCargados.xlsx')
}

export const downloadExcelPlantilla = (
  columnasplantillaExcel: string[],
  writeFile: any
) => {
  const worksheet = XLSX.utils.aoa_to_sheet([columnasplantillaExcel])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Hoja1')
  writeFile(workbook, 'PlantillaCarga.xlsx')
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
