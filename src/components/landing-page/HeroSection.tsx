'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'


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

const HeroSection: React.FC = () => {
  const [activeButton, setActiveButton] = useState<number | null>(null)
  const [showLegalPopup, setShowLegalPopup] = useState(false)
  

  const toggleLegalPopup = () => setShowLegalPopup(prev => !prev)

  return (
    <section className="heroSection" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Botones Superiores */}
      <button className="legalButton" onClick={toggleLegalPopup} aria-label="Ver información legal">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
      </button>

      <button className="adminButton">
        ADM
        <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
      </button>

      {/* Popup Legal */}
      {showLegalPopup && (
        <>
          <div className="overlay" onClick={toggleLegalPopup}></div>
          <div className="legalPopup">
            <button className="closeButton" onClick={toggleLegalPopup}>✕</button>
            <div className="legalTitle">
              LEY N° 031, Art. 129: (...)<br />Atribuciones del SEA, en el ámbito de la información:
            </div>
            <div className="legalContent">
              <ol>
                <li>Procesar, sistematizar y evaluar...</li>
                <li>Poner a disposición de la población toda la información...</li>
              </ol>
            </div>
          </div>
        </>
      )}

      {/* SVG Animado */}
      <div className={`holographicShapes${activeButton !== null ? ' animate' : ''}`} style={{ position: 'absolute', top: '-50%', left: '-50%', width: '100%', height: '100%', zIndex: 700 }}>
        <SVGRenderer activeIndex={activeButton ?? 0} svgOptions={svgOptions} />
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
                width={70}
                height={70}
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
              <img 
                src="/svg/holographic_municipios.svg" 
                alt="Mapa de Bolivia"
                style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.9, zIndex: 9999, position: 'relative' }}
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
