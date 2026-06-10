'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Button, Modal, Box, Typography, Tooltip, IconButton } from '@mui/material'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined'
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'


import DatosFiscalesDashboard from '@/components/DatosFiscalesDashboard'
import VisorDashboard from '@/components/VisorDashboard'
import FichasMunicipalesDashboard from '@/components/FichasMunicipalesDashboard'

import HilandoAutonomias from '@/components/HilandoAutonomias'
import { useThemeContext } from '@/themes/ThemeRegistry'

import LogoAnimado from '../../../public/svg/logoSEA.svg'

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

const BottomAnimatedCharts: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [activeChart, setActiveChart] = useState<number>(0);
  const { themeMode } = useThemeContext();
  const chartTypes = ['wave', 'line', 'bar', 'area', 'candle'];

  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => {
      setActiveChart(prev => (prev + 1) % chartTypes.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const waveData1 = useMemo(() => Array.from({ length: 20 }, () => 20 + Math.random() * 30), []);
  const waveData2 = useMemo(() => Array.from({ length: 20 }, () => 10 + Math.random() * 40), []);
  const waveData3 = useMemo(() => Array.from({ length: 20 }, () => 5 + Math.random() * 50), []);
  const lineData = useMemo(() => Array.from({ length: 30 }, () => 15 + Math.random() * 70), []);
  const barData = useMemo(() => Array.from({ length: 60 }, () => 5 + Math.random() * 80), []);
  const areaData1 = useMemo(() => Array.from({ length: 30 }, () => 10 + Math.random() * 50), []);
  const areaData2 = useMemo(() => Array.from({ length: 30 }, () => 5 + Math.random() * 60), []);
  const candleData = useMemo(() => Array.from({ length: 40 }, () => {
    const min = 10 + Math.random() * 50;
    const max = min + 10 + Math.random() * 30;
    const open = min + Math.random() * (max - min);
    const close = min + Math.random() * (max - min);
    return { min, max, open, close };
  }), []);

  const buildWavePath = (data: number[]) => {
    const dx = 100 / (data.length - 1);
    let path = `M 0 ${100 - data[0]}`;
    for (let i = 0; i < data.length - 1; i++) {
      const x1 = i * dx;
      const y1 = 100 - data[i];
      const x2 = (i + 1) * dx;
      const y2 = 100 - data[i + 1];
      const mx = (x1 + x2) / 2;
      path += ` C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
    }
    path += ` L 100 100 L 0 100 Z`;
    return path;
  };

  const buildWaveOutlinePath = (data: number[]) => {
    const dx = 100 / (data.length - 1);
    let path = `M 0 ${100 - data[0]}`;
    for (let i = 0; i < data.length - 1; i++) {
      const x1 = i * dx;
      const y1 = 100 - data[i];
      const x2 = (i + 1) * dx;
      const y2 = 100 - data[i + 1];
      const mx = (x1 + x2) / 2;
      path += ` C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
    }
    return path;
  };

  const buildCurrentLinePath = (data: number[]) => {
    return 'M 0 ' + (100 - data[0]) + data.map((d, i) => ` L ${i * (100 / (data.length - 1))} ${100 - d}`).join('');
  };

  const buildAreaPath = (data: number[]) => {
    return 'M 0 100 L 0 ' + (100 - data[0]) + data.map((d, i) => ` L ${i * (100 / (data.length - 1))} ${100 - d}`).join('') + ' L 100 100 Z';
  };

  const currentType = chartTypes[activeChart];

  if (!isMounted) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100vw',
      height: '35vh',
      zIndex: 1,
      pointerEvents: 'none',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: currentType === 'wave' ? (themeMode === 'light' ? 0.22 : 0.12) : 0,
        transition: 'opacity 2s',
      }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0px -2px 8px rgba(0, 182, 179, 0.4))' }}>
          <defs>
            <linearGradient id="waveGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#00bfff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#00bfff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="waveGrad2" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0073e6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0073e6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={buildWavePath(waveData1)} fill="url(#waveGrad)" stroke="none" />
          <path d={buildWaveOutlinePath(waveData1)} fill="none" stroke="#00bfff" strokeWidth="0.5" className="animated-path" />

          <path d={buildWavePath(waveData2)} fill="url(#waveGrad2)" stroke="none" />
          <path d={buildWaveOutlinePath(waveData2)} fill="none" stroke="#0073e6" strokeWidth="0.5" className="animated-path-reverse" />

          <path d={buildWaveOutlinePath(waveData3)} fill="none" stroke="#A6CE3E" strokeWidth="0.3" className="animated-path" />
        </svg>
      </div>

      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: currentType === 'line' ? (themeMode === 'light' ? 0.22 : 0.12) : 0,
        transition: 'opacity 2s',
      }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path d={buildCurrentLinePath(lineData)} fill="none" stroke="#00B6B3" strokeWidth="0.4" className="animated-path" />
        </svg>
      </div>

      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        bottom: 0,
        opacity: currentType === 'bar' ? (themeMode === 'light' ? 0.22 : 0.12) : 0,
        transition: 'opacity 2s',
      }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          {barData.map((d, i) => (
            <rect key={i} x={i * (100 / barData.length)} y={100 - d} width={100 / barData.length - 0.5} height={d} fill="url(#barGradient)" />
          ))}
          <defs>
            <linearGradient id="barGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#00B6B3" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: currentType === 'area' ? (themeMode === 'light' ? 0.22 : 0.12) : 0,
        transition: 'opacity 2s',
      }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="areaGrad1" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#A6CE3E" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#A6CE3E" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="areaGrad2" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#F9D12B" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#F9D12B" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={buildAreaPath(areaData1)} fill="url(#areaGrad1)" stroke="none" />
          <path d={buildCurrentLinePath(areaData1)} fill="none" stroke="#A6CE3E" strokeWidth="0.5" className="animated-path" />
          <path d={buildAreaPath(areaData2)} fill="url(#areaGrad2)" stroke="none" />
          <path d={buildCurrentLinePath(areaData2)} fill="none" stroke="#F9D12B" strokeWidth="0.5" className="animated-path-reverse" />
        </svg>
      </div>

      <div style={{
        position: 'absolute',
        width: '100%',
        height: '80%',
        bottom: 0,
        opacity: currentType === 'candle' ? (themeMode === 'light' ? 0.22 : 0.12) : 0,
        transition: 'opacity 2s',
      }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          {candleData.map((d, i) => {
            const width = 100 / candleData.length;
            const x = i * width;
            const isUp = d.close > d.open;
            const color = isUp ? "#A6CE3E" : "#F7931E";
            return (
              <g key={i}>
                <line x1={x + width / 2} y1={100 - d.max} x2={x + width / 2} y2={100 - d.min} stroke={color} strokeWidth="0.2" className="candle-anim" />
                <rect x={x + width * 0.1} y={100 - Math.max(d.open, d.close)} width={width * 0.8} height={Math.max(0.5, Math.abs(d.close - d.open))} fill={color} opacity="0.8" className="candle-anim" />
              </g>
            )
          })}
        </svg>
      </div>

      <style jsx>{`
        .animated-path {
          stroke-dasharray: 200;
          animation: undulate 15s linear infinite alternate;
        }
        .animated-path-reverse {
          stroke-dasharray: 200;
          animation: undulate-rev 20s linear infinite alternate;
        }
        @keyframes undulate {
          0% { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes undulate-rev {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 200; }
        }
        .pulse-circle {
          animation: pulse 3s infinite alternate;
        }
        @keyframes pulse {
          0% { opacity: 0.1; transform: scale(0.6); }
          100% { opacity: 1; transform: scale(1.4); }
        }
        .candle-anim {
          animation: fadeCandle 4s alternate infinite;
        }
        @keyframes fadeCandle {
          0% { opacity: 0.2; }
          100% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

const RandomNumbersBackground: React.FC = () => {
  const [numbers, setNumbers] = useState<RandomNumber[]>([]);
  const nextId = useRef(0);
  const { themeMode } = useThemeContext();
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
          color: themeMode === 'light' ? 'rgba(0,180,170,0.12)' : 'rgba(255,255,255,0.18)',
          fontWeight: 700,
          fontFamily: 'sinkin_sans200_x_light',
          textShadow: themeMode === 'light' ? 'none' : '0 2px 12px rgba(0,0,0,0.18)',
          opacity: 1,
          userSelect: 'none',
          animation: `${num.direction === 'up' ? 'fadeMoveUp' : 'fadeMoveDown'} ${num.duration}ms linear`,
          transition: 'opacity 0.7s, color 0.3s',
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
  const { themeMode, toggleTheme } = useThemeContext()
  const [mapIndex, setMapIndex] = useState<number>(0)
  const [fade, setFade] = useState<boolean>(true)
  const [activeButton, setActiveButton] = useState<number | null>(null)
  const [showHeaderTitle, setShowHeaderTitle] = useState(false)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [showContentProcess, setShowContentProcess] = useState(false);
  const [showFichasAutonomicas, setShowFichasAutonomicas] = useState(false);
  const [showDatosFiscales, setShowDatosFiscales] = useState(false);
  const [showVisorDashboard, setShowVisorDashboard] = useState(false);
  const [showFichasMunicipalesDashboard, setShowFichasMunicipalesDashboard] = useState(false);

  const [showHilando, setShowHilando] = useState(false);

  const [hoveredFicha, setHoveredFicha] = useState<string | null>(null);
  const [mapShrinking, setMapShrinking] = useState(false);
  const [mapGrowing, setMapGrowing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasEmbedParam, setHasEmbedParam] = useState(false);

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
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has('embed') || searchParams.has('iframe')) {
        setHasEmbedParam(true);
      }
    }
  }, []);

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
      setShowFichasAutonomicas(false);
      setShowDatosFiscales(false);
      setShowVisorDashboard(false);
      setShowHilando(false);
      setShowFichasMunicipalesDashboard(false);
      setMapShrinking(false);
    }, 900); // Duración de la animación
    setMobileMenuOpen(false);
  };

  // Manejar click en "Fichas Autonómicas"
  const handleShowFichasAutonomicas = () => {
    setMapShrinking(true);
    setTimeout(() => {
      setShowFichasAutonomicas(true);
      setShowContentProcess(false);
      setShowDatosFiscales(false);
      setShowVisorDashboard(false);
      setShowHilando(false);
      setShowFichasMunicipalesDashboard(false);
      setMapShrinking(false);
    }, 900);
    setMobileMenuOpen(false);
  };

  // Manejar click en "Datos Fiscales"
  const handleShowDatosFiscales = () => {
    setMapShrinking(true);
    setTimeout(() => {
      setShowDatosFiscales(true);
      setShowFichasAutonomicas(false);
      setShowContentProcess(false);
      setShowVisorDashboard(false);
      setShowHilando(false);
      setShowFichasMunicipalesDashboard(false);
      setMapShrinking(false);
    }, 900);
    setMobileMenuOpen(false);
  };

  const handleShowVisorDashboard = () => {
    setMapShrinking(true);
    setTimeout(() => {
      setShowVisorDashboard(true);
      setShowDatosFiscales(false);
      setShowFichasAutonomicas(false);
      setShowContentProcess(false);
      setShowHilando(false);
      setShowFichasMunicipalesDashboard(false);
      setMapShrinking(false);
    }, 900);
    setMobileMenuOpen(false);
  };

  const handleShowFichasMunicipalesDashboard = () => {
    setMapShrinking(true);
    setTimeout(() => {
      setShowFichasMunicipalesDashboard(true);
      setShowFichasAutonomicas(false);
      setShowDatosFiscales(false);
      setShowContentProcess(false);
      setShowVisorDashboard(false);
      setShowHilando(false);
      setMapShrinking(false);
    }, 900);
    setMobileMenuOpen(false);
  };


  const handleShowHilando = () => {
    setMapShrinking(true);
    setTimeout(() => {
      setShowHilando(true);
      // Ocultamos los otros por seguridad
      setShowFichasAutonomicas(false);
      setShowDatosFiscales(false);
      setShowVisorDashboard(false);
      setShowFichasMunicipalesDashboard(false);
      setShowContentProcess(false);
      setMapShrinking(false);
    }, 900);
    setMobileMenuOpen(false);
  };


  // Manejar click en INICIO
  const handleShowInicio = (e: React.MouseEvent) => {
    e.preventDefault();
    setMapGrowing(true);
    setShowContentProcess(false);
    setShowFichasAutonomicas(false);
    setShowDatosFiscales(false);
    setShowVisorDashboard(false);
    setShowHilando(false);
    setShowFichasMunicipalesDashboard(false);
    setMobileMenuOpen(false);
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
          background: themeMode === 'light' ? 'rgba(194, 220, 205, 0.95)' : 'rgba(33, 32, 31, 0.93)',
          textAlign: 'center',
          padding: '18px 0 8px 0',
          fontFamily: 'sinkin_sans200_x_light',
          /*fontWeight: 700,*/
          fontSize: 25,
          color: themeMode === 'light' ? '#1b2e25' : '#FFFFFF',
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
        <BottomAnimatedCharts />
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
            opacity: themeMode === 'light' ? 0.05 : 1,
            filter: themeMode === 'light' ? 'invert(1)' : 'none',
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
              color: var(--shift-indigena-0, #F7931E);
              text-shadow: none;
              filter: none;
            }
            50% {
              color: var(--shift-indigena-50, #F9B44A);
              text-shadow: none;
              filter: none;
            }
            100% {
              color: var(--shift-indigena-0, #F7931E);
              text-shadow: none;
              filter: none;
            }
          }

          @keyframes colorShiftRegional {
            0% {
              color: var(--shift-regional-0, #50C0B2);
              text-shadow: none;
              filter: none;
            }
            50% {
              color: var(--shift-regional-50, #7CD6CB);
              text-shadow: none;
              filter: none;
            }
            100% {
              color: var(--shift-regional-0, #50C0B2);
              text-shadow: none;
              filter: none;
            }
          }

          @keyframes colorShiftMunicipal {
            0% {
              color: var(--shift-municipal-0, #A6CE3E);
              text-shadow: none;
              filter: none;
            }
            50% {
              color: var(--shift-municipal-50, #C4E06C);
              text-shadow: none;
              filter: none;
            }
            100% {
              color: var(--shift-municipal-0, #A6CE3E);
              text-shadow: none;
              filter: none;
            }
          }

          @keyframes colorShiftDepartamental {
            0% {
              color: var(--shift-dept-0, #F9D12B);
              text-shadow: none;
              filter: none;
            }
            50% {
              color: var(--shift-dept-50, #FBE06C);
              text-shadow: none;
              filter: none;
            }
            100% {
              color: var(--shift-dept-0, #F9D12B);
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

          /* Estilos para el menú mobile */
          .mobile-menu-button {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: auto;
            margin-right: 25px;
            margin-top: 25px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
            z-index: 12001;
          }

          .desktop-menu {
            display: none;
          }

          .mobile-menu-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 11999;
          }

          .mobile-menu-overlay.open {
            display: block;
          }

          .mobile-menu {
            display: none;
            position: fixed;
            top: 0;
            right: 0;
            width: 100%;
            max-width: 300px;
            height: 100vh;
            background: white;
            box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
            z-index: 12000;
            padding-top: 80px;
            overflow-y: auto;
            transform: translateX(100%);
            transition: transform 0.3s ease;
          }

          .mobile-menu.open {
            display: flex;
            flex-direction: column;
            transform: translateX(0);
          }

          .mobile-menu ul {
            display: flex;
            flex-direction: column;
            gap: 0;
            list-style: none;
            margin: 0;
            padding: 0;
            width: 100%;
          }

          .mobile-menu li {
            border-bottom: 1px solid #e0e0e0;
          }

          .mobile-menu a,
          .mobile-menu button {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            text-decoration: none;
            color: #333;
            font-family: 'sinkin_sans200_x_light';
            font-weight: 700;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            width: 100%;
            border: none;
            background: none;
            cursor: pointer;
            transition: background 0.2s;
          }

          .mobile-menu a:hover,
          .mobile-menu button:hover {
            background: #f5f5f5;
          }

          .mobile-menu button {
            padding: 16px;
          }

          @media (max-width: 1023px) {
            .fixedLogo {
              margin-right: auto;
            }
          }

          @media (min-width: 1024px) {
            .mobile-menu-overlay.open,
            .mobile-menu.open {
              display: none !important;
            }

            .mobile-menu-button {
              display: none !important;
            }

            .desktop-menu {
              display: flex;
              align-items: center;
            }
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
            <div className="fixedLogo" style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%' }}>
              <a href="http://www.sea.gob.bo" target="_blank" rel="noopener noreferrer">
                <div className="logo-desktop">
                  <LogoAnimado
                    width={77}
                    height={77}
                    style={{ marginLeft: 25, marginTop: 14 }}
                    className="logoImage"
                  />
                </div>
                <div className="logo-mobile">
                  <LogoAnimado
                    width={50}
                    height={50}
                    style={{ marginLeft: 25, marginTop: 14 }}
                    className="logoImage"
                  />
                </div>
              </a>

              {/* Menú Desktop */}
              <nav className="desktop-menu" style={{ marginLeft: 'auto', marginRight: 25, height: '100%', position: 'relative' }}>
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
                  <li><button onClick={handleOpenModal} style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0 0 6px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }} aria-label="Ver información legal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#8B898B' }}>
                      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                      <path d="M8 8h8M8 12h8M8 16h4" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button></li>
                  <li>
                    <IconButton
                      onClick={toggleTheme}
                      sx={{
                        color: '#8B898B',
                        padding: '0 0 6px 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': {
                          color: themeMode === 'light' ? '#F7931E' : '#00B6B3',
                          transform: 'scale(1.1)',
                        },
                        transition: 'color 0.22s, transform 0.18s',
                      }}
                      aria-label="Cambiar tema"
                    >
                      {themeMode === 'light' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="5" fill="none" />
                          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="none" />
                        </svg>
                      )}
                    </IconButton>
                  </li>

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

              {/* Botón Hamburguesa */}
              <button
                className="mobile-menu-button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Abrir menú"
                style={{
                  color: '#8B898B',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Overlay Mobile */}
            <div
              className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menú Mobile */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
              <ul>
                <li><a href="#" onClick={handleShowInicio}>INICIO</a></li>

                <li><a href="#">Acerca de</a></li>
                <li><button onClick={() => { handleOpenModal(); setMobileMenuOpen(false); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#333', marginRight: 8 }}>
                    <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path d="M8 8h8M8 12h8M8 16h4" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  Información Legal
                </button></li>
                <li>
                  <button onClick={() => { toggleTheme(); setMobileMenuOpen(false); }}>
                    {themeMode === 'light' ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: '#333', marginRight: 8 }}>
                          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="none" />
                        </svg>
                        TEMA OSCURO
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: '#333', marginRight: 8 }}>
                          <circle cx="12" cy="12" r="5" fill="none" />
                          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                        </svg>
                        TEMA CLARO
                      </>
                    )}
                  </button>
                </li>

              </ul>
            </div>

            {/* Puntos animados */}
            {!(hasEmbedParam && isMobile) && (
              <div className={`animatedDots${(showContentProcess || showFichasAutonomicas || showDatosFiscales || showVisorDashboard || showHilando || showFichasMunicipalesDashboard || mapShrinking) ? ' shrinkToTop' : ''}`}>
                {[1, 2, 3, 4, 5, 6].map(dot => (
                  <div key={`dot-${dot}`} className={`pulseDot dot${dot}`} aria-hidden="true" />
                ))}
              </div>
            )}

            {/* Título principal */}
            {!(hasEmbedParam && isMobile) && (
              <div className={`mainTitle${(showContentProcess || showFichasAutonomicas || showDatosFiscales || showVisorDashboard || showHilando || showFichasMunicipalesDashboard || mapShrinking) ? ' shrinkToTop' : ''}`} style={{ zIndex: 99999 }}>
                <h1>Centro de</h1>
                <span>Datos Autonómicos</span>
              </div>
            )}

            {/* Mapa */}
            {/* Animación de achicamiento y aparición */}
            {(!showContentProcess && !showFichasAutonomicas && !showDatosFiscales && !showFichasMunicipalesDashboard && !showVisorDashboard && !showHilando || mapGrowing) && (
              <div className={`mapContainer${mapShrinking ? ' shrinking' : ''}${mapGrowing ? ' growing' : ''}`.trim()}>
                <div className="circleMapContainer">
                  {/* SVG Animado - Mostrando los tres elementos específicos */}
                  <div className="holographicShapes animate" style={{ position: 'absolute', top: '-43%', left: '-70%', width: '100%', height: '100%', zIndex: 1 }}>
                    <SVGRenderer isLight={themeMode === 'light'} />
                  </div>
                  {/* Filtro SVG para mejorar el aspecto visual */}
                  <svg width="0" height="0">
                    <filter id="mapGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </svg>
                  <img
                    className="mapImage"
                    src={mapImages[mapIndex]}
                    alt="Mapa de Bolivia"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      opacity: fade ? 0.9 : 0,
                      zIndex: 9999,
                      position: 'relative',
                      transition: 'opacity 1.5s, filter 0.5s',
                      filter: themeMode === 'light'
                        ? (mapIndex === 3 // Departamental
                          ? 'brightness(0) saturate(100%) invert(47%) sepia(87%) saturate(1472%) hue-rotate(352deg) brightness(101%) contrast(101%) drop-shadow(0 4px 14px rgba(255, 112, 20, 0.45))'
                          : mapIndex === 0 // Municipal
                          ? 'brightness(0) saturate(100%) invert(24%) sepia(45%) saturate(1478%) hue-rotate(85deg) brightness(95%) contrast(102%) drop-shadow(0 4px 14px rgba(27, 94, 32, 0.45))'
                          : mapIndex === 2 // Indigena
                          ? 'brightness(0) saturate(100%) invert(41%) sepia(87%) saturate(2462%) hue-rotate(18deg) brightness(98%) contrast(101%) drop-shadow(0 4px 14px rgba(230, 81, 0, 0.45))'
                          : 'brightness(0) saturate(100%) invert(20%) sepia(87%) saturate(1243%) hue-rotate(143deg) brightness(94%) contrast(101%) drop-shadow(0 4px 14px rgba(0, 77, 64, 0.45))') // Regional
                        : 'none',
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
                        className={`category-label-text ${mapIndex === configMapIndex ? 'colorShiftText' : ''}`}
                        style={{
                          animation: mapIndex === configMapIndex ? `${animation} 3s ease-in-out infinite` : 'none',
                          fontFamily: 'sinkin_sans100_thin',
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

            {/* Vista de Fichas Autonómicas */}
            {showFichasAutonomicas && (
              <div
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2, // Bajado desde 99999 para que no bloquee los enlaces superiores
                  transition: 'opacity 0.5s',
                  animation: 'growAndAppear 0.9s cubic-bezier(0.7,0,0.3,1) forwards',
                  paddingBottom: 120, // To avoid overlapping with bottom buttons
                }}
              >
                <div style={{ position: 'relative', width: '100%', maxWidth: '1400px', display: 'flex', justifyContent: 'center' }}>
                  <div className="fichasTitleContainer">
                    <AssessmentOutlinedIcon className="fichasTitleIcon" />
                    <h2 className="fichasTitleText">
                      Fichas Autonómicas
                    </h2>
                  </div>
                  <IconButton
                    title="Volver atrás"
                    onClick={handleShowInicio}
                    sx={{
                      position: 'absolute',
                      right: { xs: 15, md: 40 },
                      top: { xs: 0, md: '10px' },
                      color: '#08B0A7',
                      border: themeMode === 'light' ? '1px solid rgba(8, 176, 167, 0.3)' : '1px solid rgba(255, 255, 255, 0.2)',
                      background: themeMode === 'light' ? 'rgba(8, 176, 167, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '8px',
                      '&:hover': {
                        background: themeMode === 'light' ? 'rgba(8, 176, 167, 0.12)' : 'rgba(255, 255, 255, 0.15)',
                        borderColor: themeMode === 'light' ? 'rgba(8, 176, 167, 0.5)' : 'rgba(255, 255, 255, 0.4)',
                      }
                    }}
                  >
                    <ArrowBackOutlinedIcon />
                  </IconButton>
                </div>

                <div className="fichasGridContainer">
                  {[
                    { label: 'Fichas\nMunicipales', icon: '/svg/holographic_mapa_municipios.svg', color: '#A6CE3E' },
                    { label: 'Fichas\nDepartamentales', icon: '/svg/holographic_mapa_departamentos.svg', color: '#F9D12B' },
                    { label: 'Fichas\nRegionales', icon: '/svg/holographic_mapa_regional.svg', color: '#50C0B2' },
                    { label: 'Fichas Indígena\nOriginario Campesino', icon: '/svg/holographic_mapa_indigena.svg', color: '#F7931E' },
                  ].map((btn, idx) => (
                    <div
                      key={idx}
                      className="fichasCategoryWrapper"
                      style={{ position: 'relative' }}
                      onMouseEnter={() => setHoveredFicha(btn.label)}
                      onMouseLeave={() => setHoveredFicha(null)}
                    >
                      <div
                        className="fichasCategoryBox"
                        style={{ '--hover-color': btn.color } as any}
                        onClick={btn.label === 'Fichas\nMunicipales' ? handleShowFichasMunicipalesDashboard : undefined}
                      >
                        <img src={btn.icon} alt={btn.label.replace('\\n', ' ')} className="fichasCategoryIcon" />
                        <div className="bottomButtonText" style={{ marginTop: '15px' }}>{btn.label}</div>
                        <div className="bottomButtonGlow"></div>
                      </div>

                      {/* Se eliminaron los submenús de Fichas Municipales y Fichas Indígenas a petición del usuario */}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vista de Datos Fiscales */}
            {showDatosFiscales && (
              <DatosFiscalesDashboard onClose={handleShowFichasAutonomicas} />
            )}

            {/* Vista de Fichas Municipales */}
            {showFichasMunicipalesDashboard && (
              <FichasMunicipalesDashboard onClose={handleShowFichasAutonomicas} />
            )}

            {/* Vista de Visor Georreferenciado */}
            {showVisorDashboard && (
              <VisorDashboard onClose={() => handleShowInicio({ preventDefault: () => { } } as React.MouseEvent)} />
            )}

            {/* Vista de Hilando */}
            {showHilando && (
              <HilandoAutonomias onClose={() => handleShowInicio({ preventDefault: () => { } } as React.MouseEvent)} />
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

            {/* ----- BOTONES INFERIORES ----- */}
            {(!showContentProcess && !showFichasAutonomicas && !showDatosFiscales && !showVisorDashboard && !showHilando && !showFichasMunicipalesDashboard || mapGrowing) && (
              <div className={`bottomButtonsContainer${mapShrinking ? ' shrinking' : ''}${mapGrowing ? ' growing' : ''}`.trim()}>
                {[
                  { label: 'Visor de Datos\nGeorreferenciados', icon: <MapOutlinedIcon sx={{ fontSize: 36 }} /> },
                  { label: 'Fichas\nAutonómicas', icon: <AssessmentOutlinedIcon sx={{ fontSize: 36 }} /> },
                  { label: 'Directorio\nAutonómico', icon: <ContactsOutlinedIcon sx={{ fontSize: 36 }} /> },
                  { label: 'Hilando las\nAutonomías', icon: <TrendingUpOutlinedIcon sx={{ fontSize: 36 }} /> },
                ].map((btn, idx) => (
                  <div
                    key={idx}
                    className="bottomButtonBox"
                    onClick={
                      btn.label === 'Fichas\nAutonómicas' ? handleShowFichasAutonomicas :
                        btn.label === 'Visor de Datos\nGeorreferenciados' ? handleShowVisorDashboard :
                          //btn.label === 'Directorio\nAutonómico' ? handleShowDirectorioAutonomico :
                          btn.label === 'Hilando las\nAutonomías' ? handleShowHilando :
                            undefined
                    }
                  >
                    <div className="bottomButtonIcon">{btn.icon}</div>
                    <div className="bottomButtonText">{btn.label}</div>
                    <div className="bottomButtonGlow"></div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        <style jsx>{`
          .mapContainer {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
            padding-bottom: 120px; /* Sube todos los contenedores holográficos para los botones inferiores */
          }

          .bottomButtonsContainer {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            right: 7%;
            width: 500px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            z-index: 10000;
            flex-wrap: wrap; /* Para pantallas más pequeñas */
          }
          .bottomButtonBox {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 140px;
            height: 120px;
            background: rgba(8, 176, 167, 0.05); /* Ligeramente teal translúcido */
            border: 1px solid rgba(8, 176, 167, 0.3); /* Contorno teal */
            border-radius: 12px;
            backdrop-filter: blur(8px);
            cursor: pointer;
            transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            text-align: center;
            color: #C0C0C0; /* Texto gris claro base */
            z-index: 1;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          .bottomButtonBox::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(135deg, rgba(8, 176, 167, 0.2) 0%, rgba(8, 176, 167, 0) 100%);
            opacity: 0;
            transition: opacity 0.35s ease;
            z-index: -1;
          }
          .bottomButtonBox:hover {
            border-color: rgba(8, 176, 167, 0.9);
            transform: translateY(-6px);
            box-shadow: 0 10px 25px rgba(8, 176, 167, 0.3);
            color: #FFFFFF; /* Ilumina texto */
          }
          .bottomButtonBox:hover::before {
            opacity: 1; /* Ilumina gradiente */
          }
          .bottomButtonIcon {
            color: #08B0A7; /* Teal para el íncono */
            margin-bottom: 12px;
            transition: all 0.35s ease;
          }
          .bottomButtonBox:hover .bottomButtonIcon {
            color: #FFFFFF;
            transform: scale(1.15);
            filter: drop-shadow(0 0 10px rgba(8, 176, 167, 0.6));
          }
          .bottomButtonText {
            font-family: 'sinkin_sans200_x_light', sans-serif;
            font-size: 11px;
            font-weight: 700;
            line-height: 1.35;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            white-space: pre-line;
          }

          .fichasTitleContainer {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 40px;
            color: #fff;
          }
          .fichasTitleIcon {
            font-size: 48px !important;
            color: #08B0A7;
          }
          .fichasTitleText {
            font-family: 'sinkin_sans200_x_light', sans-serif;
            font-size: 32px;
            margin: 0;
            font-weight: 700;
            letter-spacing: 1.5px;
          }

          .fichasGridContainer {
            display: flex;
            gap: 24px;
            flex-wrap: wrap;
            justify-content: center;
            padding: 0 20px;
          }

          @media (max-width: 768px) {
            .fichasTitleContainer {
              margin-bottom: 25px;
              gap: 10px;
            }
            .fichasTitleIcon {
              font-size: 32px !important;
            }
            .fichasTitleText {
              font-size: 20px;
              letter-spacing: 1px;
            }
            .fichasGridContainer {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
              justify-items: center;
              padding: 0 10px;
              width: 100%;
              max-width: 400px;
            }
            .fichasCategoryBox {
              width: 140px !important;
              height: 165px !important;
              padding: 10px !important;
              box-sizing: border-box !important;
            }
            .fichasCategoryIcon {
              width: 75px !important;
              height: 75px !important;
              margin-bottom: 5px !important;
            }
            .bottomButtonText {
              font-size: 10px !important;
              line-height: 1.2 !important;
            }
          }

          .fichasCategoryBox {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 170px;
            height: 210px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            backdrop-filter: blur(8px);
            cursor: pointer;
            transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            text-align: center;
            color: #C0C0C0;
            z-index: 1;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          .fichasCategoryBox::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(135deg, var(--hover-color) 0%, rgba(255,255,255,0) 100%);
            opacity: 0;
            transition: opacity 0.35s ease;
            z-index: -1;
          }
          .fichasCategoryBox:hover {
            border-color: var(--hover-color);
            transform: translateY(-6px);
            box-shadow: 0 10px 25px var(--hover-color);
            color: #FFFFFF;
          }
          .fichasCategoryBox:hover::before {
            opacity: 0.2;
          }
          .fichasCategoryIcon {
            width: 134px;
            height: 134px;
            object-fit: contain;
            transition: all 0.35s ease;
            filter: drop-shadow(0 0 0 transparent);
          }
          .fichasCategoryBox:hover .fichasCategoryIcon {
            transform: scale(1.11);
            filter: drop-shadow(0 0 10px var(--hover-color));
          }

          .subFichasContainer {
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%) translateY(10px);
            display: flex;
            gap: 15px;
            opacity: 0;
            pointer-events: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 10;
          }
          .subFichasContainer.visible {
            opacity: 1;
            pointer-events: auto;
            transform: translateX(-50%) translateY(20px);
          }
          .subFichasContainer::before {
            content: '';
            position: absolute;
            top: -20px;
            left: 0;
            right: 0;
            height: 20px;
          }
          /* Línea vertical de conexión */
          .subFichasContainer::after {
            content: '';
            position: absolute;
            bottom: 100%;
            left: 50%;
            width: 2px;
            height: 20px;
            background: rgba(255, 255, 255, 0.25);
            transform: translateX(-50%);
            z-index: -1;
          }
          .subFichasBox {
            width: 140px;
            height: 120px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            backdrop-filter: blur(8px);
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            transition: all 0.35s ease;
            color: #C0C0C0;
            padding: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          .subFichasBox:hover {
            border-color: var(--hover-color);
            transform: translateY(-4px);
            box-shadow: 0 8px 20px var(--hover-color);
            color: #FFFFFF;
          }
          .subFichasIcon {
            margin-bottom: 8px;
            transition: all 0.35s ease;
          }
          .subFichasBox:hover .subFichasIcon {
            transform: scale(1.15);
            filter: drop-shadow(0 0 10px var(--hover-color));
          }

          .subSubFichasContainer {
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%) translateY(10px);
            display: flex;
            opacity: 0;
            pointer-events: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 20;
          }
          .subSubFichasContainer.visible {
            opacity: 1;
            pointer-events: auto;
            transform: translateX(-50%) translateY(20px);
          }
          .subSubFichasContainer::before {
            content: '';
            position: absolute;
            top: -20px;
            left: 0;
            right: 0;
            height: 20px;
          }
          /* Línea vertical de conexión */
          .subSubFichasContainer::after {
            content: '';
            position: absolute;
            bottom: 100%;
            left: 50%;
            width: 2px;
            height: 20px;
            background: rgba(255, 255, 255, 0.25);
            transform: translateX(-50%);
            z-index: -1;
          }
          .subSubFichasBox {
            width: 130px;
            height: 105px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            backdrop-filter: blur(8px);
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            transition: all 0.35s ease;
            color: #C0C0C0;
            padding: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          .subSubFichasBox:hover {
            border-color: var(--hover-color);
            transform: translateY(-4px);
            box-shadow: 0 8px 20px var(--hover-color);
            color: #FFFFFF;
          }
          .subSubFichasBox:hover .subFichasIcon {
            transform: scale(1.15);
            filter: drop-shadow(0 0 10px var(--hover-color));
          }

          @media (max-width: 768px) {
            .mapContainer {
              padding-bottom: 200px; /* Más espacio para los botones en 2x2 en móvil */
            }
            
                .mapContainer {
                  max-height: 75vh;
                  margin: auto;
                  transform: scale(0.77);
                  transform-origin: center center;
                  margin-top: -20px;
                }
            
            
            .bottomButtonsContainer {
              top: auto !important;
              transform: none !important;
              bottom: 25px !important;
              gap: 12px !important;
              right: 0 !important;
              left: 0 !important;
              width: 100% !important;
              padding: 0 20px !important;
              justify-content: center !important;
            }
            .bottomButtonBox {
              width: 140px; /* Mantenerlos grandes en 2x2 */
              height: 100px;
            }
            .bottomButtonIcon {
              margin-bottom: 8px;
            }
            .bottomButtonIcon :global(svg) {
              font-size: 32px !important;
            }
            .bottomButtonText {
              font-size: 10px;
            }
          }
          @media (max-width: 480px) {
            .bottomButtonsContainer {
              bottom: 20px !important;
              gap: 10px !important;
            }
            .bottomButtonBox {
              width: calc(50% - 16px);
              max-width: 130px;
              height: 105px;
            }
            .bottomButtonIcon :global(svg) {
              font-size: 28px !important;
            }
          }
          @media (max-width: 932px) and (orientation: landscape) {
            .mapContainer {
              padding-bottom: 80px; /* Ajuste en landscape */
            }
            .bottomButtonsContainer {
              top: auto !important;
              transform: none !important;
              bottom: 10px !important;
              gap: 10px !important;
              flex-wrap: nowrap;
              right: 0 !important;
              left: 0 !important;
              width: 100% !important;
              justify-content: center !important;
            }
            .bottomButtonBox {
              width: 105px;
              height: 75px;
            }
            .bottomButtonIcon {
              margin-bottom: 4px;
            }
            .bottomButtonIcon :global(svg) {
              font-size: 20px !important;
            }
            .bottomButtonText {
              font-size: 8px;
            }
          }
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
          .mapImage {
            transform: scale(2.43);
          }
          .category-label-text {
            font-size: 22px;
          }
          .logo-desktop { display: block; }
          .logo-mobile { display: none; }

          @media (max-width: 768px) {
            .logo-desktop { display: none; }
            .logo-mobile { display: none; }

            .mapImage {
              transform: scale(1);
            }
            .category-label-text {
              font-size: 14px;
            }
            
            :global(.animatedDots) {
              position: fixed !important;
              top: 25px !important;
              left: 20px !important;
              transform: none !important;
              z-index: 12003 !important;
              gap: 4px !important;
            }

            :global(.pulseDot) {
              width: 5px !important;
              height: 5px !important;
            }
            
            :global(.mainTitle) {
              position: fixed !important;
              top: 30px !important;
              left: 35px !important;
              transform: none !important;
              text-align: left !important;
              width: auto !important;
              display: flex;
              flex-direction: column;
              align-items: flex-start !important;
              z-index: 12002 !important;
              pointer-events: none;
            }
            :global(.mainTitle h1) {
              font-size: 17px !important;
              margin: 0 !important;
              line-height: 1.1 !important;
            }
            :global(.mainTitle span) {
              font-size: 17px !important;
              margin: 0 !important;
              line-height: 1.1 !important;
            }
          }
          
          @media (max-width: 932px) and (orientation: landscape) {
            .logo-desktop { display: none; }
            .logo-mobile { 
              display: none !important;
            }
            .logo-mobile img {
              width: 34px !important;
              height: 34px !important;
              margin: 0 !important;
            }

             .mapImage {
              transform: scale(0.65) !important;
            }
             .category-label-text {
              font-size: 10px !important;
            }
            
            :global(.animatedDots) {
               top: 50px !important;
               left: 27px !important;
               gap: 4px !important;
            }
            :global(.pulseDot) {
              width: 5px !important;
              height: 5px !important;
            }

            :global(.mainTitle) {
               top: 50px !important;
               left: 42px !important;
            }
            :global(.mainTitle h1), :global(.mainTitle span) {
              font-size: 17px !important;
            }

             .mobile-menu-button {
              margin-top: 10px !important;
            }
          }

          
          @media (min-width: 1025px) and (max-width: 1540px) {
            .mapContainer {
              max-height: 75vh;
              margin: auto;
              transform: scale(0.61);
              transform-origin: center center;
            }
            .mapImage {
               object-fit: contain;
            }
            .mapContainer.shrinking {
              animation: shrinkAndFade1540 0.9s cubic-bezier(0.7,0,0.3,1) forwards;
            }
            .mapContainer.growing {
              animation: growAndAppear1540 0.9s cubic-bezier(0.7,0,0.3,1) forwards;
            }
          }

          @keyframes growAndAppear1540 {
            0% {
              opacity: 0;
              transform: scale(0);
            }
            20% {
              opacity: 0.2;
              transform: scale(0.17);
            }
            100% {
              opacity: 1;
              transform: scale(0.85);
            }
          }

          @keyframes shrinkAndFade1540 {
            0% {
              opacity: 1;
              transform: scale(0.85);
            }
            80% {
              opacity: 0.2;
              transform: scale(0.17);
            }
            100% {
              opacity: 0;
              transform: scale(0);
              pointer-events: none;
            }
          }



          /* Animación de achicamiento y desaparición del mapa y elementos relacionados */
          .mapContainer.shrinking, .bottomButtonsContainer.shrinking {
            animation: shrinkAndFade 0.9s cubic-bezier(0.7,0,0.3,1) forwards;
          }
          .mapContainer.growing, .bottomButtonsContainer.growing {
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

          /* Overrides de contraste para modo claro */
          body[data-theme='light'] .bottomButtonBox {
            color: #1b2e25 !important;
            background: rgba(255, 255, 255, 0.45) !important;
            border-color: rgba(8, 176, 167, 0.5) !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06) !important;
          }
          body[data-theme='light'] .bottomButtonBox:hover {
            color: #004d40 !important;
            background: rgba(255, 255, 255, 0.65) !important;
            border-color: rgba(8, 176, 167, 0.9) !important;
            box-shadow: 0 8px 20px rgba(8, 176, 167, 0.2) !important;
          }
          body[data-theme='light'] .bottomButtonBox:hover .bottomButtonIcon {
            color: #004d40 !important;
            filter: drop-shadow(0 0 8px rgba(8, 176, 167, 0.5)) !important;
          }
          body[data-theme='light'] .fichasTitleContainer {
            color: #1b2e25 !important;
          }
          body[data-theme='light'] .fichasCategoryBox {
            background: rgba(255, 255, 255, 0.5) !important;
            border: 1px solid rgba(0, 0, 0, 0.12) !important;
            color: #1b2e25 !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06) !important;
          }
          body[data-theme='light'] .fichasCategoryBox:hover {
            color: #000000 !important;
            background: rgba(255, 255, 255, 0.75) !important;
            border-color: var(--hover-color) !important;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1) !important;
          }
          body[data-theme='light'] .fichasCategoryBox:hover .fichasCategoryIcon {
            filter: brightness(0.85) contrast(1.2) !important;
          }

          body[data-theme='light'] .categoryText {
            color: #2c3e35 !important;
            text-shadow: 0 1px 3px rgba(255, 255, 255, 0.5) !important;
          }
          body[data-theme='light'] .categoryText:hover {
            color: #000000 !important;
          }
          
          /* Soporte de tema oscuro para menú móvil */
          body[data-theme='dark'] .mobile-menu {
            background: #2a2928 !important;
            box-shadow: -2px 0 8px rgba(0, 0, 0, 0.35) !important;
          }
          body[data-theme='dark'] .mobile-menu a,
          body[data-theme='dark'] .mobile-menu button {
            color: #EDEDED !important;
          }
          body[data-theme='dark'] .mobile-menu li {
            border-bottom: 1px solid #3f3e3d !important;
          }
          body[data-theme='dark'] .mobile-menu a:hover,
          body[data-theme='dark'] .mobile-menu button:hover {
            background: #373635 !important;
          }
        `}</style>
      </section >
    </>
  )
}
