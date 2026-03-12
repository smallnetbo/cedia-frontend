import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L, { LatLngExpression } from 'leaflet'
import { Box, CircularProgress } from '@mui/material'
import { getDataGeneralFinal } from './api/apiMap'
import { tipoGobierno } from '@/types/map/entidad.interface'
import { GeoJsonObject } from 'geojson'
import { ObjetoEntidad } from '@/types/map/map.interface'
import HoverCard from './HoverCard'
import ReloadButton from './CenterButton'

const initialStyleMap = {
  color: '#fafafa',
  weight: 2,
  opacity: 1,
  fillOpacity: 0.8,
  fillColor: '#08B0A7',
}

interface MapInnerInterface {
  clickFeature: Function
  typeVisualize: tipoGobierno
  selectedEntidad: number
  selectedEntidad2?: number
  selectedButton: string
  eleccionYear?: string
  filterDepto?: string | null
}
const DynamicMap = ({
  clickFeature,
  typeVisualize,
  selectedEntidad,
  selectedEntidad2,
  selectedButton,
  eleccionYear,
  filterDepto,
}: MapInnerInterface) => {
  const mapRef = useRef<L.Map | null>(null)
  const geoJSONRef = useRef<L.GeoJSON<GeoJsonObject> | null>(null)
  const mapData = useRef<any>()

  const municipioStateRef = useRef<boolean>(false)
  const dynamicZoom = useRef<number>(5)
  const [isLoading, setIsLoading] = useState(true)

  const [, setPropertiesFeature] = useState<ObjetoEntidad | null>(null)
  const [hoverPropertiesFeature, setHoverPropertiesFeature] =
    useState<ObjetoEntidad | null>(null)
  
  const [partyColors, setPartyColors] = useState<Record<string, string>>({})

  const selectedEntidadRef = useRef(selectedEntidad)
  const selectedEntidad2Ref = useRef(selectedEntidad2)

  useEffect(() => {
    selectedEntidadRef.current = selectedEntidad
    selectedEntidad2Ref.current = selectedEntidad2
  }, [selectedEntidad, selectedEntidad2])

  const position: LatLngExpression = [-16.403839, -64.170288]

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      let data = await getDataGeneralFinal(typeVisualize);
      mapData.current = data;
      
      // Fetch party colors 
      let colors: Record<string, string> = {};
      if (eleccionYear) {
          try {
              let url = `/api/electos?gestion=${eleccionYear}&tipo=${typeVisualize}`;
              if (filterDepto) url += `&depto=${encodeURIComponent(filterDepto)}`;
              const res = await fetch(url);
              const json = await res.json();
              if (json && json.data) {
                  json.data.forEach((item: any) => {
                      colors[item.codigoEta] = item.color;
                  });
              }
          } catch(e) {
              console.error(e);
          }
      }
      setPartyColors(colors);

      if (geoJSONRef.current) {
        geoJSONRef.current.clearLayers()
        // If filterDepto is present avoid displaying all other departments/municipalities
        let filteredFeatures = data;
        if (filterDepto && data.features) {
            filteredFeatures = {
                ...data,
                features: data.features.filter((f: any) => f.properties.nom_dpto === filterDepto)
            };
        }
        geoJSONRef.current.addData(filteredFeatures)
      }
      setPropertiesFeature(null)

      setIsLoading(false)
    }
    fetchData()
  }, [typeVisualize, selectedButton, eleccionYear, filterDepto])

  useEffect(() => {
    const updateSelections = () => {
      if (!isLoading && geoJSONRef.current !== null) {
        if (!mapData.current) return;

        const config = {
          GAD: { color: '#FF9B3E' },
          GAM: { color: '#F79A38' },
          GAR: { color: '#F7F338' },
          GAIOC: { color: '#38F738' },
        }[typeVisualize] || { color: '#50C0B2' };

        let bounds: L.LatLngBounds | null = null;
        
        geoJSONRef.current.eachLayer((layer: any) => {
          let feature = layer.feature;
          let isSelected = selectedEntidad === Number(feature.properties.c_ut_dep) || selectedEntidad2 === Number(feature.properties.c_ut_dep);
          
          let colorPartido = partyColors[feature.properties.c_ut_dep] || '#08B0A7';

          if (isSelected) {
            layer.setStyle({
              weight: 6,
              color: '#ff0000',
              fillOpacity: 1,
              fillColor: colorPartido,
            });
            layer.bringToFront();
            if (!bounds) {
              bounds = layer.getBounds();
            } else {
              bounds.extend(layer.getBounds());
            }
          } else {
            layer.setStyle({
              color: '#fafafa',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8,
              fillColor: colorPartido,
            });
          }
        });

        if (bounds && (selectedEntidad !== 0 || selectedEntidad2 !== 0)) {
          mapRef.current?.flyToBounds(bounds, { duration: 1.5, animate: true });
        } else if (selectedEntidad === 0 && selectedEntidad2 === 0) {
          mapRef.current?.setView(position, dynamicZoom.current);
        }
      }
    }
    updateSelections()
  }, [selectedEntidad, selectedEntidad2, typeVisualize, isLoading])

  const onEachFeature = (feature: any, layer: any) => {
    if (feature.properties) {
      const entidad = feature.properties.nom_dpto
      layer.bindTooltip(entidad)
      layer.on({
        mouseover: (e: any) => {
          const l = e.target
          let isSelected = selectedEntidadRef.current === Number(feature.properties.c_ut_dep) || selectedEntidad2Ref.current === Number(feature.properties.c_ut_dep);
          
          let colorPartido = partyColors[feature.properties.c_ut_dep] || '#08B0A7';

          if (!isSelected) {
            l.setStyle({
              weight: 3,
              color: '#fff',
              fillOpacity: 0.95,
              fillColor: colorPartido,
            })
            l.bringToFront()
          }
          if (feature.properties !== hoverPropertiesFeature) {
            setHoverPropertiesFeature(feature.properties)
          }
        },
        mouseout: (e: any) => {
          const l = e.target
          let isSelected = selectedEntidadRef.current === Number(feature.properties.c_ut_dep) || selectedEntidad2Ref.current === Number(feature.properties.c_ut_dep);
          
          let colorPartido = partyColors[feature.properties.c_ut_dep] || '#08B0A7';

          if (!isSelected) {
            l.setStyle({
              color: '#fafafa',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8,
              fillColor: colorPartido,
            })
          }
          setHoverPropertiesFeature(null)
        },
        click: (e: any) => {
          e.originalEvent.preventDefault()
          e.originalEvent.stopPropagation()
          clickFeature(feature.properties)
          setPropertiesFeature(feature.properties)
        },
      })
    }
  }
  const handleReloadMap = () => {
    mapRef.current?.setView(position, dynamicZoom.current)
  }
  return (
    <Box position="relative" width="100%" height="100%">
      {isLoading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress />
        </Box>
      )}
      {!isLoading && (
        <MapContainer
          ref={mapRef}
          center={position}
          zoom={dynamicZoom.current}
          minZoom={dynamicZoom.current - 1}
          scrollWheelZoom={true}
          doubleClickZoom={false}
          touchZoom={false}
          style={{ width: '100%', height: '100%', zIndex: '0' }}
          //whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          <GeoJSON
            ref={geoJSONRef}
            style={(feature) => {
              let colorPartido = partyColors[feature?.properties.c_ut_dep] || '#08B0A7';
              return {
                color: '#fafafa',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8,
                fillColor: colorPartido,
              }
            }}
            onEachFeature={onEachFeature}
            data={mapData.current}
          />

          <ReloadButton onClick={handleReloadMap} />
        </MapContainer>
      )}
      {hoverPropertiesFeature !== null && (
        <HoverCard
          type={typeVisualize}
          hoverPropertiesFeature={hoverPropertiesFeature}
        />
      )}
    </Box>
  )
}

export default DynamicMap
