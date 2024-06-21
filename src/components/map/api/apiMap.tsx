import { Constantes } from '@/config/Constantes'
import { Servicios } from '@/services'
import { Entidad, tipoGobierno } from '@/types/map/entidad.interface'

const cache: { [key in tipoGobierno]: any } = {
  GAD: null,
  GAM: null,
  GAR: null,
  GAIOC: null,
}

export const getDataGeneralFinal = async (typeVisualize: tipoGobierno) => {
  if (cache[typeVisualize]) {
    return cache[typeVisualize]
  }
  switch (typeVisualize) {
    case 'GAD':
      return await getGeoJSONFromDatabase(
        Constantes.baseUrl +
          '/entidad/nivelGobierno/?nivelGobierno=' +
          typeVisualize,
        'GAD'
      )
    case 'GAM':
      return await getGeoJSONFromDatabase(
        Constantes.baseUrl +
          '/entidad/nivelGobierno/?nivelGobierno=' +
          typeVisualize,
        'GAM'
      )
    case 'GAR':
      return await getGeoJSONFromDatabase(
        Constantes.baseUrl +
          '/entidad/nivelGobierno/?nivelGobierno=' +
          typeVisualize,
        'GAR'
      )
    case 'GAIOC':
      return await getGeoJSONFromDatabase(
        Constantes.baseUrl +
          '/entidad/nivelGobierno/?nivelGobierno=' +
          typeVisualize,
        'GAIOC'
      )
    default:
      return null
  }
}

const getGeoJSONFromDatabase = async (
  url: string,
  typeVisualize: tipoGobierno
) => {
  try {
    const respuesta = await Servicios.get({ url })

    const datosRespuesta = respuesta.datos
    //Creacion de nuevo objeto a partir de los resultados obtenido de la peticion agregando en campo type:"Polygon"
    const datosRespuestaConType = datosRespuesta.map((item: any) => ({
      ...item,
      type: 'Polygon',
    }))

    const datosMultipoligonoRespuesta = await import(
      './CoordenadasMultipoligono.json'
    ) /*Json con las entidades que tiene multipoligono */
    const datosMultipoligono = datosMultipoligonoRespuesta.datos

    //Creacion de un nuevo objeto para reemplazar las coordenadas y type a las entidades que son Multipoligono
    const datosRespuestaActualizados = datosRespuestaConType.map(
      (respuesta: any) => {
        const multipoligono = datosMultipoligono.find(
          (mp: any) => mp.codigo === respuesta.codigoEntidad
        )

        if (multipoligono) {
          return {
            ...respuesta,
            coordenadasGeograficas: multipoligono.coordenadasGeograficas,
            type: multipoligono.type,
          }
        }

        return respuesta
      }
    )

    const data = formatDataToGeoJSON(datosRespuestaActualizados)

    cache[typeVisualize] = data
    return data
  } catch (error) {
    console.error('Error fetching data:', error)
    return null
  }
}

const formatDataToGeoJSON = (data: Entidad[]) => {
  const geojson = {
    type: 'FeatureCollection',
    features: [] as any[],
  }

  data.forEach((dato) => {
    const feature = {
      type: 'Feature',
      properties: {
        c_ut_dep: dato.codigoEntidad,
        nom_dpto: dato.nombre,
        st_area_sh: 58056828545.5,
        st_length_: 2136341.41859,
      },
      geometry: {
        type: dato.type,
        coordinates:
          dato.type === 'Polygon'
            ? [dato.coordenadasGeograficas]
            : dato.coordenadasGeograficas,
      },
    }
    geojson.features.push(feature)
  })

  return geojson
}
