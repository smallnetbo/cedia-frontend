const fs = require('fs')
const path = require('path')

const iconsDir = path.resolve(__dirname, '../node_modules/@mui/icons-material')

const outputDir = path.resolve(__dirname, 'iconosSvg')
const outputPath = path.join(outputDir, 'iconos.json')

const isIconFile = (fileName) =>
  fileName.endsWith('.js') || fileName.endsWith('.ts')

const extractIconNames = (fileContent) => {
  const iconRegex = /export\s+const\s+(\w+)\s*:\s*SvgIconComponent;/g
  const matches = []
  let match

  while ((match = iconRegex.exec(fileContent)) !== null) {
    matches.push(match[1])
  }

  return matches
}

const getAllIconFiles = () => {
  return fs.readdirSync(iconsDir).filter(isIconFile)
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const generateIconFile = () => {
  const iconFiles = getAllIconFiles()
  const allIcons = {}

  iconFiles.forEach((file) => {
    const filePath = path.join(iconsDir, file)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const iconNames = extractIconNames(fileContent)

    iconNames.forEach((iconName) => {
      allIcons[iconName] = iconName.toLowerCase()
    })
  })

  fs.writeFileSync(outputPath, JSON.stringify(allIcons, null, 2))
}

generateIconFile()
