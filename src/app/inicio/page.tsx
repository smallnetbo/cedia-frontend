'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Button, Modal, Box, Typography, Tooltip } from '@mui/material'

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
  <Image src={src} alt={alt} width={48} height={48} />
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

// Descripciones para los tooltips de cada nivel de gobierno
const categoryDescriptions: Record<string, { title: string, desc: string }> = {
  departamental: {
    title: 'Nivel Departamental',
    desc: 'Gobiernos Autónomos Departamentales (GAD): Administran los nueve departamentos de Bolivia. Tienen competencias en desarrollo económico, social, infraestructura y gestión de recursos naturales. Población total: ~12 millones.'
  },
  indigena: {
    title: 'Nivel Indígena Originario Campesino',
    desc: 'Gobiernos Autónomos Indígena Originario Campesinos (GAIOC): Basados en territorio ancestral, autogobierno y normas propias. Competencias en gestión territorial, cultura y recursos naturales. Población: ~200 mil.'
  },
  municipal: {
    title: 'Nivel Municipal',
    desc: 'Gobiernos Autónomos Municipales (GAM): Administran los municipios del país. Competencias en servicios básicos, desarrollo urbano y rural, salud y educación. Población: ~8 millones.'
  },
  regional: {
    title: 'Nivel Regional',
    desc: 'Gobiernos Autónomos Regionales (GAR): Agrupan municipios y/o territorios indígenas para gestión conjunta. Competencias en desarrollo regional, infraestructura y servicios. Población: ~1 millón.'
  },
}

const enlaceColors = ['#00B6B3', '#A6CE3E', '#F7931E'];

// Componente para mostrar números aleatorios animados en el fondo
const randomNumberTypes = [
  { type: 'cifra', format: () => (Math.floor(Math.random() * 90000) + 10000).toLocaleString('es-BO') },
  { type: 'porcentaje', format: () => `${(Math.random() * 100).toFixed(1)}%` },
  { type: 'indicador', format: () => (Math.random() * 10).toFixed(2) },
]

interface RandomNumber {
  id: number;
  value: string;
  x: number;
  y: number;
  opacity: number;
  size: number;
  duration: number;
  direction: 'up' | 'down';
  offset: number;
  isCounter?: boolean;
  startValue?: number;
  endValue?: number;
  type?: 'cifra' | 'porcentaje' | 'indicador';
  isItalic?: boolean;
}

const MAX_NUMBERS = 18;

// Componente para animar el valor de un número tipo contador
const AnimatedNumberSpan: React.FC<{ num: RandomNumber; style: React.CSSProperties }> = ({ num, style }) => {
  const [display, setDisplay] = React.useState(num.value);
  React.useEffect(() => {
    if (!num.isCounter || num.startValue === undefined || num.endValue === undefined) {
      setDisplay(num.value);
      return;
    }
    let raf: number;
    const start = performance.now();
    const duration = num.duration * 0.85;
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      let current;
      if (num.type === 'cifra') {
        current = Math.round(num.startValue! + (num.endValue! - num.startValue!) * progress);
        setDisplay(current.toLocaleString('es-BO'));
      } else if (num.type === 'porcentaje') {
        current = num.startValue! + (num.endValue! - num.startValue!) * progress;
        setDisplay(`${current.toFixed(1)}%`);
      } else if (num.type === 'indicador') {
        current = num.startValue! + (num.endValue! - num.startValue!) * progress;
        setDisplay(current.toFixed(2));
      }
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [num]);
  return <span style={style}>{display}</span>;
};

const RandomNumbersBackground: React.FC = () => {
  const [numbers, setNumbers] = useState<RandomNumber[]>([]);
  const nextId = useRef(0);
  const timersRef = useRef<{ [key: number]: NodeJS.Timeout }>({});

  useEffect(() => {
    const addNumber = () => {
      setNumbers(prev => {
        if (prev.length >= MAX_NUMBERS) return prev;
        const typeObj = randomNumberTypes[Math.floor(Math.random() * randomNumberTypes.length)];
        const type = typeObj.type as 'cifra' | 'porcentaje' | 'indicador';
        const isCounter = Math.random() < 0.3; // 30% serán contadores
        let value = typeObj.format();
        let startValue = undefined;
        let endValue = undefined;
        if (isCounter) {
          if (type === 'cifra') {
            endValue = parseInt(value.replace(/\./g, ''));
            startValue = Math.floor(endValue * (0.2 + Math.random() * 0.5));
            value = startValue.toLocaleString('es-BO');
          } else if (type === 'porcentaje') {
            endValue = parseFloat(value.replace('%', ''));
            startValue = parseFloat((endValue * (0.2 + Math.random() * 0.5)).toFixed(1));
            value = `${startValue.toFixed(1)}%`;
          } else if (type === 'indicador') {
            endValue = parseFloat(value);
            startValue = parseFloat((endValue * (0.2 + Math.random() * 0.5)).toFixed(2));
            value = startValue.toFixed(2);
          }
        }
        const x = Math.random() * 90; // porcentaje
        const y = Math.random() * 90;
        const opacity = 0;
        const size = 18 + Math.random() * 32;
        const duration = 3500 + Math.random() * 2500;
        const direction = Math.random() > 0.5 ? 'up' : 'down';
        const offset = 18 + Math.random() * 22; // desplazamiento px
        const id = nextId.current++;
        // Decidir si el número será en cursiva (30% de probabilidad)
        const isItalic = Math.random() < 0.3;
        // Programar eliminación
        timersRef.current[id] = setTimeout(() => {
          setNumbers(prev2 => prev2.filter(n => n.id !== id));
          delete timersRef.current[id];
        }, duration);
        return [
          ...prev,
          {
            id,
            value,
            x,
            y,
            opacity,
            size,
            duration,
            direction,
            offset,
            isCounter,
            startValue,
            endValue,
            type,
            isItalic,
          },
        ];
      });
    };
    const interval = setInterval(addNumber, 2340);
    return () => {
      clearInterval(interval);
      // Limpiar todos los timers
      Object.values(timersRef.current).forEach(clearTimeout);
      timersRef.current = {};
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 1,
      overflow: 'hidden',
    }}>
      {numbers.map(num => {
        const style: React.CSSProperties = {
          position: 'absolute',
          left: `${num.x}%`,
          top: `${num.y}%`,
          fontSize: `${num.size}px`,
          color: 'rgba(255,255,255,0.18)',
          fontWeight: 700,
          fontFamily: 'sinkin_sans200_x_light',
          textShadow: '0 2px 12px rgba(0,0,0,0.18)',
          opacity: 1,
          userSelect: 'none',
          animation: `${num.direction === 'up' ? 'fadeMoveUp' : 'fadeMoveDown'} ${num.duration}ms linear`,
          transition: 'opacity 0.7s',
          whiteSpace: 'nowrap',
          willChange: 'opacity, transform',
          ['--offset' as any]: `${num.offset}px`,
          fontStyle: num.isItalic ? 'italic' : 'normal',
        };
        if (num.isCounter) {
          return <AnimatedNumberSpan key={num.id} num={num} style={style} />;
        } else {
          return <span key={num.id} style={style}>{num.value}</span>;
        }
      })}
      <style jsx global>{`
        @keyframes fadeMoveUp {
          0% { opacity: 0; transform: scale(0.7) translateY(0); }
          10% { opacity: 0.7; transform: scale(1.08) translateY(0); }
          40% { opacity: 0.85; transform: scale(1) translateY(0); }
          80% { opacity: 0.7; transform: scale(1) translateY(calc(var(--offset, 30px) * -1)); }
          100% { opacity: 0; transform: scale(0.7) translateY(calc(var(--offset, 30px) * -1)); }
        }
        @keyframes fadeMoveDown {
          0% { opacity: 0; transform: scale(0.7) translateY(0); }
          10% { opacity: 0.7; transform: scale(1.08) translateY(0); }
          40% { opacity: 0.85; transform: scale(1) translateY(0); }
          80% { opacity: 0.7; transform: scale(1) translateY(var(--offset, 30px)); }
          100% { opacity: 0; transform: scale(0.7) translateY(var(--offset, 30px)); }
        }
      `}</style>
    </div>
  );
};

export default function InicioPage(): JSX.Element {
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [mapIndex, setMapIndex] = useState<number>(0)
  const [fade, setFade] = useState<boolean>(true)
  const [activeButton, setActiveButton] = useState<number | null>(null)
  const [showHeaderTitle, setShowHeaderTitle] = useState(false)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  // Estados para animación de "Ver Contenidos"
  const [showContentProcess, setShowContentProcess] = useState(false);
  const [mapShrinking, setMapShrinking] = useState(false);
  const [mapGrowing, setMapGrowing] = useState(false);

  // Refs para las secciones
  const section1Ref = useRef<HTMLDivElement>(null)
  const section2Ref = useRef<HTMLDivElement>(null)
  const section3Ref = useRef<HTMLDivElement>(null)

  const handleOpenModal = () => setOpenModal(true)
  const handleCloseModal = () => setOpenModal(false)

  useEffect(() => {
    const handleScroll = () => {
      const threshold = window.innerHeight * 0.34;
      if (window.scrollY > threshold) {
        setShowHeaderTitle(true);
      } else {
        setShowHeaderTitle(false);
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setMapIndex(prev => (prev + 1) % mapImages.length)
        setFade(true)
      }, 0)
    }, 14300)
    return () => clearInterval(interval)
  }, [isPaused])

  // Función para hacer scroll suave
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Manejar click en "Ver Contenidos"
  const handleShowContentProcess = (e: React.MouseEvent) => {
    e.preventDefault();
    setMapShrinking(true);
    setTimeout(() => {
      setShowContentProcess(true);
      setMapShrinking(false);
    }, 900); // Duración de la animación
  };

  // Manejar click en INICIO
  const handleShowInicio = (e: React.MouseEvent) => {
    e.preventDefault();
    setMapGrowing(true);
    setShowContentProcess(false);
    setTimeout(() => {
      setMapGrowing(false);
    }, 900); // Duración de la animación inversa
  };

  return (
    <>
      {/* Título fijo y centrado solo al hacer scroll */}
      {showHeaderTitle && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          zIndex: 10000,
          background: 'rgba(255, 255, 255, 0.93)',
          textAlign: 'center',
          padding: '18px 0 8px 0',
          fontFamily: 'sinkin_sans200_x_light',
          /*fontWeight: 700,*/
          fontSize: 25,
          color: '#08B0A7',
          letterSpacing: 1.43,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'opacity 0.3s',
          opacity: showHeaderTitle ? 1 : 0
        }}>
          Centro de Datos Autonómicos
        </div>
      )}

      <section
        ref={section1Ref}
        className="heroSection"
        style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}
        aria-label="Sección de bienvenida y mapa interactivo"
      >
        {/* Números aleatorios animados en el fondo */}
        <RandomNumbersBackground />
        {/* Imagen de fondo a pantalla completa */}
        <img
          src="/inicio/background_landing_page.webp"
          alt="Fondo Centro de Datos Autonómicos"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            zIndex: 0,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
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

          .fixedLogo {
            position: fixed;
            top: 0;
            left: 0;
            z-index: 12000;
            background: none;
          }

          .scrollIconAnimated {
            transition: opacity 0.3s;
          }

          /* Efecto hover sutil para los enlaces del menú */
          .menu-link {
            transition: color 0.22s cubic-bezier(0.4,0,0.2,1), transform 0.18s cubic-bezier(0.4,0,0.2,1);
            position: relative;
          }
          .menu-link:hover {
            color: #00B6B3;
            transform: scale(1.11);
          }
          .menu-link::after {
            content: '';
            display: block;
            position: absolute;
            left: 0;
            right: 0;
            bottom: -2px;
            height: 2px;
            background: linear-gradient(90deg, #00B6B3 0%, #A6CE3E 100%);
            border-radius: 2px;
            opacity: 0;
            transform: scaleX(0.4);
            transition: opacity 0.18s, transform 0.22s cubic-bezier(0.4,0,0.2,1);
          }
          .menu-link:hover::after {
            opacity: 1;
            transform: scaleX(1);
          }
        `}</style>
        <style jsx global>{`
          body {
            overflow-x: hidden !important;
          }
          html {
            overflow-x: hidden !important;
          }
          /* Scrollbar minimalista vertical */
          ::-webkit-scrollbar {
            width: 8px;
            background: #3F3F3F;
          }
          ::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 6px;
            min-height: 40px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #666;
          }
          /* Firefox */
          html {
            scrollbar-color: #888 #3F3F3F;
            scrollbar-width: thin;
          }
        `}</style>
        {/* Botón de administración */}
        <Button
          className="muiButton adminButton"
          aria-label="Acceso administrador"
          size="small"
          sx={{
            position: 'fixed',
            zIndex: 12000,
            right: 20,
            top: 20,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
            },
          }}
        >
          {/* Solo el ícono, sin texto ADM */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" style={{marginLeft: 0}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            zIndex: 12000,
            right: 130,
            top: 30,
            '&:hover': {
              backgroundColor: 'transparent',
            },
          }}
        >
          {/* Solo el ícono de legal, sin texto LEGAL */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="4" y="4" width="16" height="16" rx="2" stroke="white" strokeWidth="2" fill="none"/>
            <path d="M8 8h8M8 12h8M8 16h4" stroke="white" strokeWidth="2"/>
          </svg>
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
            <div className="fixedLogo" style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <a href="http://www.sea.gob.bo" target="_blank" rel="noopener noreferrer">
                <Image
                  src="svg/logo_sea_full.svg"
                  alt="Logo SEA Bolivia"
                  width={173}
                  height={100}
                  style={{ marginLeft: 25, marginTop: 14 }}
                  className="logoImage"
                  priority
                />
              </a>
              {/* Menú de enlaces */}
              <nav style={{ display: 'flex', alignItems: 'center', marginLeft: 32, height: '100%', position: 'relative' }}>
                <ul style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 38,
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  height: '100%',
                  position: 'relative',
                }}>
                  <li><a href="#" className="menu-link" onClick={handleShowInicio} style={{
                    fontFamily: 'sinkin_sans200_x_light',
                    fontWeight: 700,
                    fontSize: 12,
                    color: '#8B898B',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    padding: '0 0 6px 0',
                  }}>INICIO</a></li>
                  <li><a href="#" className="menu-link" onClick={handleShowContentProcess} style={{
                    fontFamily: 'sinkin_sans200_x_light',
                    fontWeight: 700,
                    fontSize: 12,
                    color: '#8B898B',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    padding: '0 0 6px 0',
                  }}>Ver Contenidos</a></li>
                  <li><a href="#" className="menu-link" style={{
                    fontFamily: 'sinkin_sans200_x_light',
                    fontWeight: 700,
                    fontSize: 12,
                    color: '#8B898B',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    padding: '0 0 6px 0',
                  }}>Iniciar Consultas</a></li>
                  <li><a href="#" className="menu-link" style={{
                    fontFamily: 'sinkin_sans200_x_light',
                    fontWeight: 700,
                    fontSize: 12,
                    color: '#8B898B',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    padding: '0 0 6px 0',
                  }}>Fichas Sectoriales</a></li>
                  <li><a href="#" className="menu-link" style={{
                    fontFamily: 'sinkin_sans200_x_light',
                    fontWeight: 700,
                    fontSize: 12,
                    color: '#8B898B',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    padding: '0 0 6px 0',
                  }}>Acerca de</a></li>
                </ul>
                {/* Línea única debajo del menú */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: -7,
                  height: 0,
                  borderBottom: '1.5px solid #8B898B',
                  width: '100%',
                  margin: '0 auto',
                }} />
              </nav>
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
            {/* Animación de achicamiento y aparición */}
            {(!showContentProcess || mapGrowing) && (
              <div
                className={`mapContainer${mapShrinking ? ' shrinking' : ''}${mapGrowing ? ' growing' : ''}`.trim()}
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                <div className="circleMapContainer">
                  {/* SVG Animado - Mostrando los tres elementos específicos */}
                  <div className="holographicShapes animate" style={{ position: 'absolute', top: '-50%', left: '-70%', width: '100%', height: '100%', zIndex: 1 }}>
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
                      scale: 2.43
                    }}
                  />
                </div>
                {/* Categorías */}
                {categoryConfig.map(({ type, label, mapIndex: configMapIndex, animation }) => (
                  <Tooltip
                    key={type}
                    title={
                      <div style={{ fontFamily: 'sinkin_sans100_thin', fontSize: 13, color: '#fff', padding: 2, maxWidth: 240 }}>
                        <div style={{ fontWeight: 700, marginBottom: 2 }}>{categoryDescriptions[type].title}</div>
                        <div style={{ fontWeight: 400, whiteSpace: 'pre-line' }}>{categoryDescriptions[type].desc}</div>
                      </div>
                    }
                    arrow
                    enterDelay={300}
                    leaveDelay={100}
                    placement="top"
                    slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 10] } }] } }}
                    componentsProps={{ tooltip: { sx: { bgcolor: '#444', color: '#fff', boxShadow: 3, borderRadius: 2, p: 1.2, fontFamily: 'sinkin_sans100_thin', fontSize: 13, maxWidth: 240 } } }}
                  >
                    <div 
                      className={`categoryText ${type}`}
                      style={{
                        opacity: mapIndex === configMapIndex ? 1 : 0.5,
                        transition: 'opacity 0.5s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={() => {
                        setIsPaused(true);
                        setMapIndex(configMapIndex);
                      }}
                      onMouseLeave={() => {
                        setIsPaused(false);
                      }}
                    >
                      <span
                        className={mapIndex === configMapIndex ? 'colorShiftText' : ''}
                        style={{
                          animation: mapIndex === configMapIndex ? `${animation} 3s ease-in-out infinite` : 'none',
                          fontFamily: 'sinkin_sans100_thin',
                          fontSize: 22,
                          letterSpacing: 0.5,
                          lineHeight: 1.15,
                          whiteSpace: 'pre-line',
                          textShadow: '0 1px 6px rgba(0,0,0,0.07)',
                          transition: 'color 0.3s',
                          fontWeight: mapIndex === configMapIndex ? 700 : 400,
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  </Tooltip>
                ))}
              </div>
            )}
            {/* Texto EN PROCESO centrado */}
            {showContentProcess && (
              <div
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 99999,
                  fontSize: 38,
                  fontWeight: 700,
                  color: '#08B0A7',
                  fontFamily: 'sinkin_sans200_x_light',
                  letterSpacing: 2,
                  transition: 'opacity 0.5s',
                  opacity: 1,
                  pointerEvents: 'none',
                }}
              >
                EN PROCESO
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          @keyframes bounceFadeScroll {
            0% {
              transform: translateY(0);
              opacity: 0.7;
            }
            30% {
              opacity: 1;
            }
            50% {
              transform: translateY(12px);
              opacity: 0.85;
            }
            70% {
              opacity: 1;
            }
            100% {
              transform: translateY(0);
              opacity: 0.7;
            }
          }
          .scrollIconAnimated {
            transition: opacity 0.3s;
          }
          /* Animación de achicamiento y desaparición del mapa y elementos relacionados */
          .mapContainer.shrinking {
            animation: shrinkAndFade 0.9s cubic-bezier(0.7,0,0.3,1) forwards;
          }
          .mapContainer.growing {
            animation: growAndAppear 0.9s cubic-bezier(0.7,0,0.3,1) forwards;
          }
          @keyframes growAndAppear {
            0% {
              opacity: 0;
              transform: scale(0);
            }
            20% {
              opacity: 0.2;
              transform: scale(0.2);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          @keyframes shrinkAndFade {
            0% {
              opacity: 1;
              transform: scale(1);
            }
            80% {
              opacity: 0.2;
              transform: scale(0.2);
            }
            100% {
              opacity: 0;
              transform: scale(0);
              pointer-events: none;
            }
          }
        `}</style>
      </section>
    </>
  )
}
