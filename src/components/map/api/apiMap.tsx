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
      return null
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
    const data = formatDataToGeoJSON(respuesta.datos)

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
    features: [],
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
        type: 'Polygon',
        coordinates: [dato.coordenadasGeograficas],
      },
    }
    geojson.features.push(feature)
  })
  const data1 = JSON.stringify(geojson)
  const data2 = JSON.parse(data1)
  return geojson
}
