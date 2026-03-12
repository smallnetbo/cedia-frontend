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
          '/entidad/nivelGobierno?nivelGobierno=' +
          typeVisualize,
        'GAD'
      )
    case 'GAM':
      return await getGeoJSONFromDatabase(
        Constantes.baseUrl +
          '/entidad/nivelGobierno?nivelGobierno=' +
          typeVisualize,
        'GAM'
      )
    case 'GAR':
      return await getGeoJSONFromDatabase(
        Constantes.baseUrl +
          '/entidad/nivelGobierno?nivelGobierno=' +
          typeVisualize,
        'GAR'
      )
    case 'GAIOC':
      return await getGeoJSONFromDatabase(
        Constantes.baseUrl +
          '/entidad/nivelGobierno?nivelGobierno=' +
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

    const datosCoordenadas = await import(
      './CoordenadasTodas.json'
    ) /* fallback de coordinadas completas */
    const coordenadasHash = datosCoordenadas.default || datosCoordenadas

    // Creacion de un nuevo objeto para inicializar coordenadas y type
    const datosRespuestaActualizados = datosRespuestaConType.map(
      (respuesta: any) => {
        const geometria = (coordenadasHash as Record<string, any>)[respuesta.codigoEntidad]

        if (geometria) {
          return {
            ...respuesta,
            coordenadasGeograficas: geometria.coordenadasGeograficas,
            type: geometria.type,
          }
        }

        return respuesta
      }
    )

    const data = formatDataToGeoJSON(datosRespuestaActualizados)

    cache[typeVisualize] = data
    return data
  } catch (error) {
    return null
  }
}

const formatDataToGeoJSON = (data: Entidad[]) => {
  const geojson = {
    type: 'FeatureCollection',
    features: [] as any[],
  }

  const entidadesConCoordenadas = data.filter((dato) => {
    return dato.coordenadasGeograficas && dato.coordenadasGeograficas.length > 0
  })

  entidadesConCoordenadas.forEach((dato) => {
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
