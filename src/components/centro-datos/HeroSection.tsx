'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Importar dinámicamente el componente SVGRenderer
const SVGRenderer = dynamic(
  () => import('../svg-animation/SVGRenderer'),
  { ssr: false }
);

const HeroSection: React.FC = () => {
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showLegalPopup, setShowLegalPopup] = useState(false);

  useEffect(() => {
    document.body.classList.add("loaded");
    return () => {
      document.body.classList.remove("loaded");
    };
  }, []);

  const handleMouseEnter = (index: number) => {
    setActiveButton(index);
  };

  const handleMouseLeave = () => {
    setActiveButton(null);
  };

  const handleCategoryMouseEnter = (category: string) => {
    setActiveCategory(category);
  };

  const handleCategoryMouseLeave = () => {
    setActiveCategory(null);
  };

  const handleToggleLegalPopup = () => {
    setShowLegalPopup(!showLegalPopup);
  };

  // Reemplazo la lógica de los botones CTA y el SVG central
  const svgOptions = [
    {
      label: 'Datos Generales y Sectoriales ok',
      subtitle: 'Electoral (2015-2021) / Fiscal / Género / Política de cuidado',
      icon: (
        //<svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#B6B6B6" strokeWidth="2"/><rect x="7" y="7" width="10" height="10" rx="2" fill="#B6B6B6"/></svg>
        <Image
        src="svg/ico_datos.svg"
        alt="datos"
        width={32}
        height={32}
        />
      ),
      svg: 'holographic_shape_ring.svg',
    },
    {
      label: 'Comparativas entre Gobiernos Autónomos',
      subtitle: 'Según: GAD / Categoría municipal y GAM/GAIOC/GAR',
      icon: (
        <Image
        src="svg/ico_comparativas.svg"
        alt="datos"
        width={32}
        height={32}
        />
      ),
      svg: 'holographic_shape_circle.svg',
    },
    {
      label: 'Cruce de variables Sectoriales',
      subtitle: 'Según: GAD / Grupos de municipios por Depto. / Grupos de municipios por Categoría municipal / GAIOC',
      icon: (
        <Image
        src="svg/ico_variables.svg"
        alt="datos"
        width={32}
        height={32}
        />
      ),
      svg: 'holographic_shape_orbits.svg',
    },
    {
      label: 'Georeferenciación de variables sectoriales',
      subtitle: 'Según nivel de gobierno',
      icon: (
        <Image
        src="svg/ico_georeferenciacion.svg"
        alt="datos"
        width={32}
        height={32}
        />
      ),
      svg: 'holographic_shape_big.svg',
    },
    {
      label: 'Índices e Indicadores',
      subtitle: 'Evaluación del ejercicio efectivo de competencias',
      icon: (
        <Image
        src="svg/ico_indices.svg"
        alt="datos"
        width={32}
        height={32}
        />
      ),
      svg: 'holographic_shape_bolivia.svg',
    },
  ];

  return (
    <section className="heroSection" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Botones Superpuestos */}
      <button 
        className="legalButton"
        onClick={handleToggleLegalPopup}
        aria-label="Ver información legal"
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      </button>

      <button className="adminButton">
        ADM
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </button>

      {/* Popup de información legal */}
      {showLegalPopup && (
        <>
          <div className="overlay" onClick={handleToggleLegalPopup}></div>
          <div className="legalPopup">
            <button className="closeButton" onClick={handleToggleLegalPopup}>
              ✕
            </button>
            <div className="legalTitle">
              LEY N° 031, Art. 129: (...)
              <br />
              Atribuciones del SEA, en el ámbito de la información:
            </div>
            <div className="legalContent">
              <ol>
                <li>
                  Procesar, sistematizar y evaluar periódicamente el desarrollo y evolución del proceso autonómico y la situación de las entidades territoriales autónomas, haciendo conocer sus resultados al Consejo Nacional de Autonomías.
                </li>
                <li>
                  Poner a disposición de la población toda la información relacionada con las entidades territoriales, para lo cual todas las entidades públicas deberán proporcionar los datos que sean requeridos por el Servicio Estatal de Autonomías. La información pública del Servicio Estatal de Autonomías será considerada como oficial (...)
                </li>
              </ol>
            </div>
          </div>
        </>
      )}

      <div 
        className={`holographicShapes${activeButton !== null ? ' animate' : ''}`}
        style={{ position: 'absolute', top: '-50%', left: '-50%', width: '100%', height: '100%', zIndex: 700 }}
      >
        <SVGRenderer activeIndex={activeButton ?? 0} svgOptions={svgOptions} />
      </div>

      {/* Contenedor para el texto del botón activo, debajo del SVG central */} 
      <div className="activeTextContainer">
        {activeButton !== null && (
          <>
            <div className="activeLabel">{svgOptions[activeButton].label}</div>
            <div className="activeSubtitle">{svgOptions[activeButton].subtitle}</div>
          </>
        )}
      </div>

      <div className="gameHolder" style={{ position: 'relative', zIndex: 1 }}>
        <div className="header">
          <div className="heroContainer"></div>

          {/* Logo fijo en esquina superior izquierda */}
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

          <div className="animatedDots">
            {[1, 2, 3, 4, 5, 6].map((dot) => (
              <div 
                key={`dot-${dot}`}
                className={`pulseDot dot${dot}`}
                aria-hidden="true"
              />
            ))}
          </div>
          
          <div className="mainTitle">
            <h1>Centro de</h1>
            <span className="subTitle">Datos Autonómicos</span>
          </div>

          {/* Categorías alrededor del mapa */}
          <div className="mapContainer">
            {/* Contenedor circular para el mapa */}
            <div className="circleMapContainer">
              {/* Aquí iría el mapa de Bolivia */}
              <img 
                src="/svg/holographic_shape_bolivia.svg" 
                alt="Mapa de Bolivia" 
                style={{ 
                  width: '160%', 
                  height: '160%', 
                  objectFit: 'contain',
                  opacity: 0.09
                }} 
              />
            </div>

            {/* Textos de categorías */}
            <div 
              className="categoryText departamental"
              onMouseEnter={() => handleCategoryMouseEnter('departamental')}
              onMouseLeave={handleCategoryMouseLeave}
            >
              Departamental
            </div>
            <div 
              className="categoryText indigena"
              onMouseEnter={() => handleCategoryMouseEnter('indigena')}
              onMouseLeave={handleCategoryMouseLeave}
            >
              Indígena Originario Campesino
            </div>
            <div 
              className="categoryText municipal"
              onMouseEnter={() => handleCategoryMouseEnter('municipal')}
              onMouseLeave={handleCategoryMouseLeave}
            >
              Municipal
            </div>
            <div 
              className="categoryText regional"
              onMouseEnter={() => handleCategoryMouseEnter('regional')}
              onMouseLeave={handleCategoryMouseLeave}
            >
              Regional
            </div>
          </div>

          {/* Botones CTA */}
          <div className="ctaContainer">
            {svgOptions.map((opt, idx) => (
              <button
                key={opt.label}
                className={`ctaButton${activeButton === idx ? ' active' : ''}`}
                onMouseEnter={() => handleMouseEnter(idx)}
                onMouseLeave={handleMouseLeave}
                aria-label={opt.label}
              >
                {opt.icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;