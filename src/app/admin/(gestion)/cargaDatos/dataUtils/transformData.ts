import { TipoDatoType } from '../../items/types/tipoDatoTypes'
import { obtenerTipoDeDatoPorId } from './tipoDatoValidaCarga'

export const transformItemsData = (
  itemsData: any[],
  tipoDato: TipoDatoType[]
) => {
  return itemsData.map((item) => {
    const tipoDatoObj = obtenerTipoDeDatoPorId(item.idTipoDato, tipoDato)
    return {
      ...item,
      nombreCorto: item.nombreCorto.toUpperCase(),
      tipoDato: tipoDatoObj.nombre,
      tipoDatoDescripcion: tipoDatoObj.descripcion,
    }
  })
}

export const dividirEnLotes = (datos: any[], tamaño: number) => {
  const lotes = []
  for (let i = 0; i < datos.length; i += tamaño) {
    lotes.push(datos.slice(i, i + tamaño))
  }
  return lotes
}
