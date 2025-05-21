'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Button, Modal, Box, Typography } from '@mui/material'


const SVGRenderer = dynamic(() => import('../svg-animation/SVGRenderer'), { ssr: false })

const svgOptions = [
  {
    label: 'Datos Generales y Sectoriales',
    subtitle: 'Electoral (2015-2021) / Fiscal / Género / Política de cuidado',
    iconSrc: 'svg/ico_datos.svg',
    svg: 'holographic_shape_ring.svg',
  },
  {
    label: 'Comparativas entre Gobiernos Autónomos',
    subtitle: 'Según: GAD / Categoría municipal y GAM/GAIOC/GAR',
    iconSrc: 'svg/ico_comparativas.svg',
    svg: 'holographic_shape_circle.svg',
  },
  {
    label: 'Cruce de variables Sectoriales',
    subtitle: 'Según: GAD / Grupos de municipios por Depto. / Grupos de municipios por Categoría municipal / GAIOC',
    iconSrc: 'svg/ico_variables.svg',
    svg: 'holographic_shape_orbits.svg',
  },
  {
    label: 'Georeferenciación de variables sectoriales',
    subtitle: 'Según nivel de gobierno',
    iconSrc: 'svg/ico_georeferenciacion.svg',
    svg: 'holographic_shape_big.svg',
  },
  {
    label: 'Índices e Indicadores',
    subtitle: 'Evaluación del ejercicio efectivo de competencias',
    iconSrc: 'svg/ico_indices.svg',
    svg: 'holographic_shape_bolivia.svg',
  },
]

const IconButton = ({ src, alt }: { src: string; alt: string }) => (
  <Image src={src} alt={alt} width={32} height={32} />
)

const mapImages = [
  '/svg/holographic_mapa_municipios.svg',
  '/svg/holographic_mapa_regional.svg',
  '/svg/holographic_mapa_indigena.svg',
  '/svg/holographic_mapa_departamentos.svg',
]

const HeroSection: React.FC = () => {
  const [openModal, setOpenModal] = useState(false)
  const [mapIndex, setMapIndex] = useState(0)
  const [fade, setFade] = useState(true)
  const [activeButton, setActiveButton] = useState<number | null>(null)

  const handleOpenModal = () => setOpenModal(true)
  const handleCloseModal = () => setOpenModal(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setMapIndex(prev => (prev + 1) % mapImages.length)
        setFade(true)
      }, 750)
    }, 7000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="heroSection" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Botón de información legal (abre el modal) */}
      <button className="legalButton" onClick={handleOpenModal} aria-label="Ver información legal">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
      </button>

      {/* Modal de Material-UI */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 370,
          bgcolor: 'transparent',
          boxShadow: 24,
          borderRadius: 3,
          p: 0,
          fontFamily: 'sinkin_sans200_x_light',
        }}>
          <Box sx={{
            bgcolor: '#C7C7C7',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            px: 2,
            py: 1.2,
            textAlign: 'center',
            fontFamily: 'sinkin_sans300_light',
          }}>
            <Typography id="modal-title" variant="subtitle1" fontWeight="bold" sx={{ fontSize: 12, color: '#222', fontFamily: 'sinkin_sans200_x_light' }}>
              LEY N° 031, Art. 129: (...)<br />Atribuciones del SEA, en el ámbito de la información:
            </Typography>
          </Box>
          <Box sx={{
            bgcolor: '#444',
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            px: 2.5,
            py: 2.5,
            color: '#fff',
            fontSize: 12,
            textAlign: 'justify',
            letterSpacing: 0.1,
            fontFamily: 'sinkin_sans200_x_light',
          }}>
            <ol style={{ paddingLeft: 18, margin: 0, fontFamily: 'sinkin_sans200_x_light' }}>
              <li style={{ marginBottom: 12 }}>
                Procesar, sistematizar y evaluar periódicamente el desarrollo y evolución del proceso autonómico y la situación de las entidades territoriales autónomas, haciendo conocer sus resultados al Consejo Nacional de Autonomías.
              </li>
              <li>
                Poner a disposición de la población toda la información relacionada a las entidades territoriales, para lo cual todas las entidades públicas deberán proporcionar los datos que sean requeridos por el Servicio Estatal de Autonomías. La información pública del Servicio Estatal de Autonomías será considerada como oficial (...)
              </li>
            </ol>
            <Button 
              onClick={handleCloseModal}
              sx={{ mt: 2, display: 'block', mx: 'auto', backgroundColor: '#C7C7C7', color: '#222', fontWeight: 'bold', fontFamily: 'sinkin_sans200_x_light', fontSize: 12, '&:hover': { backgroundColor: '#b0b0b0' } }}
              variant="contained"
            >
              Cerrar
            </Button>
          </Box>
        </Box>
      </Modal>

      <button className="adminButton">
        ADM
        <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
      </button>

      {/* SVG Animado - Mostrando los tres elementos específicos */}
      <div className="holographicShapes animate" style={{ position: 'absolute', top: '-50%', left: '-50%', width: '100%', height: '100%', zIndex: 1 }}>
        <SVGRenderer />
      </div>

      {/* Texto Activo */}
      {activeButton !== null && (
        <div className="activeTextContainer">
          <div className="activeLabel">{svgOptions[activeButton].label}</div>
          <div className="activeSubtitle">{svgOptions[activeButton].subtitle}</div>
        </div>
      )}

      <div className="gameHolder" style={{ position: 'relative', zIndex: 1 }}>
        <div className="header">
          <div className="heroContainer"></div>

          {/* Logo */}
          <div className="fixedLogo">
            <a href="http://www.sea.gob.bo" target="_blank" rel="noopener noreferrer">
              <Image
                src="svg/logo_sea_svg.svg"
                alt="Logo SEA Bolivia"
                width={52}
                height={52}
                style={{ marginLeft: 25, marginTop: 25 }}
                className="logoImage"
                priority
              />
            </a>
          </div>

          {/* Puntos animados */}
          <div className="animatedDots">
            {[1, 2, 3, 4, 5, 6].map(dot => (
              <div key={`dot-${dot}`} className={`pulseDot dot${dot}`} aria-hidden="true" />
            ))}
          </div>

          {/* Título principal */}
          <div className="mainTitle">
            <h1>Centro de</h1>
           <span>Datos Autonómicos</span>
          </div>

          {/* Mapa */}
          <div className="mapContainer">
            <div className="circleMapContainer">
              {/* Filtro SVG para mejorar el aspecto visual */}
              <svg width="0" height="0">
                <filter id="mapGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </svg>
              <img 
                 src={mapImages[mapIndex]} 
                 alt="Mapa de Bolivia"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain', 
                  opacity: fade ? 0.9 : 0, 
                  zIndex: 9999, 
                  position: 'relative', 
                  transition: 'opacity 1.5s',
                  scale: 1.34,
                  //filter: 'url(#mapGlow) contrast(1.2) brightness(1.2) saturate(1.3) drop-shadow(0 0 16px #00fff7)',
                  //WebkitFilter: 'url(#mapGlow) contrast(1.2) brightness(1.2) saturate(1.3) drop-shadow(0 0 16px #00fff7)',
                }}
              />
            </div>

            <div className="categoryText departamental">Departamental</div>
            <div className="categoryText indigena">Indígena Originario Campesino</div>
            <div className="categoryText municipal">Municipal</div>
            <div className="categoryText regional">Regional</div>
          </div>

          {/* Botones de acceso directo a la secciones del Centro de Datos */}
          <div className="contenedorEnlacesInferior">
            {svgOptions.map((opt, idx) => (
              <button
                key={opt.label}
                className={`botonEnlacesInferior${activeButton === idx ? ' active' : ''}`}
                onMouseEnter={() => setActiveButton(idx)}
                onMouseLeave={() => setActiveButton(null)}
                aria-label={opt.label}
              >
                <IconButton src={opt.iconSrc} alt={opt.label} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
