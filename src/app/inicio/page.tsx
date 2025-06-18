'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Button, Modal, Box, Typography } from '@mui/material'

interface SVGOption {
  label: string;
  subtitle: string;
  iconSrc: string;
  svg: string;
}

interface ImageIconProps {
  src: string;
  alt: string;
}

interface CategoryConfig {
  type: 'departamental' | 'indigena' | 'municipal' | 'regional';
  label: string;
  mapIndex: number;
  animation: 'colorShiftDepartamental' | 'colorShiftIndigena' | 'colorShiftMunicipal' | 'colorShiftRegional';
}

const SVGRenderer = dynamic(() => import('@/components/svg-animation/SVGRenderer'), { ssr: false })

const svgOptions: SVGOption[] = [
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

const ImageIcon: React.FC<ImageIconProps> = ({ src, alt }) => (
  <Image src={src} alt={alt} width={32} height={32} />
)

const mapImages: string[] = [
  '/svg/holographic_mapa_municipios.svg',
  '/svg/holographic_mapa_regional.svg',
  '/svg/holographic_mapa_indigena.svg',
  '/svg/holographic_mapa_departamentos.svg',
]

const categoryConfig: CategoryConfig[] = [
  {
    type: 'departamental',
    label: 'Departamental',
    mapIndex: 3,
    animation: 'colorShiftDepartamental'
  },
  {
    type: 'indigena',
    label: 'Indígena\nOriginario\nCampesino',
    mapIndex: 2,
    animation: 'colorShiftIndigena'
  },
  {
    type: 'municipal',
    label: 'Municipal',
    mapIndex: 0,
    animation: 'colorShiftMunicipal'
  },
  {
    type: 'regional',
    label: 'Regional',
    mapIndex: 1,
    animation: 'colorShiftRegional'
  }
];

export default function InicioPage(): JSX.Element {
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [mapIndex, setMapIndex] = useState<number>(0)
  const [fade, setFade] = useState<boolean>(true)
  const [activeButton, setActiveButton] = useState<number | null>(null)

  const handleOpenModal = () => setOpenModal(true)
  const handleCloseModal = () => setOpenModal(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setMapIndex(prev => (prev + 1) % mapImages.length)
        setFade(true)
      }, 0)
    }, 14300)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="heroSection" style={{ position: 'relative', overflow: 'hidden' }}>
      <style jsx>{`
        @keyframes revealText {
          0% {
            clip-path: inset(0 100% 0 0);
            transform: translateX(-20px);
            opacity: 0;
          }
          50% {
            clip-path: inset(0 0 0 0);
            transform: translateX(0);
            opacity: 1;
          }
          100% {
            clip-path: inset(0 0 0 0);
            transform: translateX(0);
            opacity: 1;
          }
        }

        .revealText {
          display: inline-block;
          animation: revealText 1.5s ease-out forwards;
        }

        @keyframes borderPulse {
          0% {
            border: 2px solid rgba(0, 115, 230, 0.3);
            box-shadow: 0 0 5px rgba(0, 115, 230, 0.3);
          }
          50% {
            border: 2px solid rgba(0, 115, 230, 1);
            box-shadow: 0 0 15px rgba(0, 115, 230, 0.8);
          }
          100% {
            border: 2px solid rgba(0, 115, 230, 0.3);
            box-shadow: 0 0 5px rgba(0, 115, 230, 0.3);
          }
        }

        .borderPulse {
          padding: 5px 15px;
          border-radius: 20px;
          animation: borderPulse 2s ease-in-out infinite;
        }

        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .gradientText {
          background: linear-gradient(
            45deg,
            #0073e6,
            #00bfff,
            #0073e6
          );
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          padding: 5px 15px;
          animation: gradientMove 3s ease infinite;
        }

        @keyframes vibrate {
          0% { transform: translate(0); }
          10% { transform: translate(-1px, 1px); }
          20% { transform: translate(1px, -1px); }
          30% { transform: translate(-1px, -1px); }
          40% { transform: translate(1px, 1px); }
          50% { transform: translate(-1px, 1px); }
          60% { transform: translate(1px, -1px); }
          70% { transform: translate(-1px, -1px); }
          80% { transform: translate(1px, 1px); }
          90% { transform: translate(-1px, 1px); }
          100% { transform: translate(0); }
        }

        .vibrateText {
          display: inline-block;
          animation: vibrate 0.3s linear infinite;
          padding: 5px 15px;
        }

        @keyframes colorShiftIndigena {
          0% {
            color: #F7931E;
            text-shadow: none;
            filter: none;
          }
          50% {
            color: #F9B44A;
            text-shadow: none;
            filter: none;
          }
          100% {
            color: #F7931E;
            text-shadow: none;
            filter: none;
          }
        }

        @keyframes colorShiftRegional {
          0% {
            color: #50C0B2;
            text-shadow: none;
            filter: none;
          }
          50% {
            color: #7CD6CB;
            text-shadow: none;
            filter: none;
          }
          100% {
            color: #50C0B2;
            text-shadow: none;
            filter: none;
          }
        }

        @keyframes colorShiftMunicipal {
          0% {
            color: #A6CE3E;
            text-shadow: none;
            filter: none;
          }
          50% {
            color: #C4E06C;
            text-shadow: none;
            filter: none;
          }
          100% {
            color: #A6CE3E;
            text-shadow: none;
            filter: none;
          }
        }

        @keyframes colorShiftDepartamental {
          0% {
            color: #F9D12B;
            text-shadow: none;
            filter: none;
          }
          50% {
            color: #FBE06C;
            text-shadow: none;
            filter: none;
          }
          100% {
            color: #F9D12B;
            text-shadow: none;
            filter: none;
          }
        }

        .colorShiftText {
          animation: colorShift 3s ease-in-out infinite;
          padding: 5px 15px;
        }

        .colorShiftMap {
          animation: colorShift 3s ease-in-out infinite;
        }

        .muiButton {
          position: fixed !important;
          z-index: 9999 !important;
          background: rgba(0, 0, 0, 0.5) !important;
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          color: white !important;
          transition: all 0.3s ease;
          width: 100px !important;
          height: 36px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 18px !important;
          font-family: 'sinkin_sans200_x_light' !important;
          font-size: 12px !important;
          text-transform: none !important;
          padding: 0 20px !important;
        }

        .muiButton:hover {
          background: rgba(0, 0, 0, 0.7) !important;
          transform: scale(1.05);
        }

        .legalButton {
          top: 20px !important;
          right: 20px !important;
        }

        .adminButton {
          top: 20px !important;
          right: 130px !important;
        }
      `}</style>
      {/* Botón de administración */}
      <Button
        className="muiButton adminButton"
        aria-label="Acceso administrador"
        size="small"
        sx={{
          position: 'fixed',
          zIndex: 9999,
          right: 20,
          top: 20,
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
        }}
      >
        ADM
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" style={{marginLeft: 6}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2" fill="none"/>
          <path d="M4 20c0-4 8-4 8-4s8 0 8 4" stroke="white" strokeWidth="2" fill="none"/>
        </svg>
      </Button>
      {/* Botón de información legal */}
      <Button
        className="muiButton legalButton"
        onClick={handleOpenModal}
        aria-label="Ver información legal"
        size="small"
        sx={{
          position: 'fixed',
          zIndex: 9999,
          right: 130,
          top: 30,
          '&:hover': {
            backgroundColor: 'transparent',
          },
        }}
      >
        LEGAL
      </Button>

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
        } as const}>
          <Box sx={{
            bgcolor: '#555555',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            px: 2,
            py: 1.2,
            textAlign: 'center',
            fontFamily: 'sinkin_sans300_light',
          } as const}>
            <Typography id="modal-title" variant="subtitle1" fontWeight="bold" sx={{ fontSize: 12, color: '#FFFFFF', fontFamily: 'sinkin_sans200_x_light' }}>
              LEY N° 031, Art. 129: (...)<br />Atribuciones del SEA, en el ámbito de la información:
            </Typography>
          </Box>
          <Box sx={{
            bgcolor: '#E38A24',
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            px: 2.5,
            py: 2.5,
            color: '#fff',
            fontSize: 12,
            textAlign: 'justify',
            letterSpacing: 0.1,
            fontFamily: 'sinkin_sans200_x_light',
          } as const}>
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

      {/* Texto Activo */}
      {activeButton !== null && (
        <div className="activeTextContainer">
          <div className="activeLabel">{svgOptions[activeButton].label}</div>
          <div className="activeSubtitle">{svgOptions[activeButton].subtitle}</div>
        </div>
      )}

      <div className="gameHolder" style={{ position: 'relative', zIndex: 1 }}>
        <div className="header">
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
          <div className="mainTitle" style={{ zIndex: 99999 }}>
            <h1>Centro de</h1>
           <span>Datos Autonómicos</span>
          </div>

          {/* Mapa */}
          <div className="mapContainer">
                  
            <div className="circleMapContainer">

              {/* SVG Animado - Mostrando los tres elementos específicos */}
              <div className="holographicShapes animate" style={{ position: 'absolute', top: '-50%', left: '-50%', width: '100%', height: '100%', zIndex: 1 }}>
                <SVGRenderer />
              </div>
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
                  scale: 1.73
                }}
              />
            </div>

            {/* Categorías */}
            {categoryConfig.map(({ type, label, mapIndex: configMapIndex, animation }) => (
              <div 
                key={type}
                className={`categoryText ${type}`} 
                style={{ 
                  opacity: mapIndex === configMapIndex ? 1 : 0.5,
                  transition: 'opacity 0.5s'
                }}
              >
                <span 
                  className={mapIndex === configMapIndex ? 'colorShiftText' : ''} 
                  style={{
                    animation: mapIndex === configMapIndex ? `${animation} 3s ease-in-out infinite` : 'none'
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
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
                <ImageIcon src={opt.iconSrc} alt={opt.label} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
