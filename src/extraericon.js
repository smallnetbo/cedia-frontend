const fs = require('fs')
const path = require('path')

// Ruta al directorio de íconos de MUI
const iconsDir = path.resolve(__dirname, '../node_modules/@mui/icons-material')

// Ruta al directorio de salida
const outputDir = path.resolve(__dirname, 'iconosSvg')
const outputPath = path.join(outputDir, 'iconosSvg.ts')

// Función para verificar si un archivo es un ícono de SVG
const isIconFile = (fileName) =>
  fileName.endsWith('.js') || fileName.endsWith('.ts')

// Función para extraer los nombres de los íconos
const extractIconNames = (fileContent) => {
  const iconRegex = /export\s+const\s+(\w+)\s*:\s*SvgIconComponent;/g
  const matches = []
  let match

  while ((match = iconRegex.exec(fileContent)) !== null) {
    matches.push(match[1])
  }

  return matches
}

// Obtener todos los archivos de íconos
const getAllIconFiles = () => {
  return fs.readdirSync(iconsDir).filter(isIconFile)
}

// Crear el directorio de salida si no existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Crear el archivo de iconos exportados
const generateIconFile = () => {
  const iconFiles = getAllIconFiles()
  const allIcons = {}

  iconFiles.forEach((file) => {
    const filePath = path.join(iconsDir, file)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const iconNames = extractIconNames(fileContent)

    iconNames.forEach((iconName) => {
      allIcons[iconName] = `import { ${iconName} } from '@mui/icons-material';`
    })
  })

  const outputContent =
    Object.values(allIcons).join('\n') +
    '\nexport { ' +
    Object.keys(allIcons).join(', ') +
    ' };'

  fs.writeFileSync(outputPath, outputContent)
  console.log('Icon list generated successfully!')
}

// Ejecutar la generación de iconos
generateIconFile()
