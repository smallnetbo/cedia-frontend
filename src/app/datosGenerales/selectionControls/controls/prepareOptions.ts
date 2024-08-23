import { Sector } from '../../sectoriales/types/sectorType'
import { Entidad } from '../../types/datosGeneralesType'

export const prepareOptions = (
  entidades: Entidad[] | undefined,
  sectores: Sector[] | undefined
) => {
  const options: { label: string; categoria?: string }[] = []

  if (entidades) {
    const categoriaMap = new Map<string, string[]>()

    entidades.forEach((entidad) => {
      const categoria = entidad.categoria?.nombre || 'Sin Categoría'
      const optionLabel = `${entidad.codigoEntidad} - ${entidad.nombre}`

      if (!categoriaMap.has(categoria)) {
        categoriaMap.set(categoria, [])
      }
      categoriaMap.get(categoria)?.push(optionLabel)
    })

    categoriaMap.forEach((labels, categoria) => {
      options.push(...labels.map((label) => ({ label, categoria })))
    })
  } else if (sectores) {
    options.push(
      ...sectores.map((sector) => ({
        label: `${sector.codigoSector} - ${sector.nombreCorto}`,
      }))
    )
  }

  return options
}
