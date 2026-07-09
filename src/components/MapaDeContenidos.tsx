'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Tooltip, IconButton } from '@mui/material';

// --- ICONOS SVG PERSONALIZADOS (ESTILO OUTLINE SLIM) ---
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const FolderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
);

const SlidersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="2" y1="14" x2="6" y2="14" />
    <line x1="10" y1="8" x2="14" y2="8" />
    <line x1="18" y1="16" x2="22" y2="16" />
  </svg>
);

const PdfIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const HelpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const DatabaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const ExpandIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

const ShrinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 14 10 14 10 20" />
    <polyline points="20 10 14 10 14 4" />
    <line x1="14" y1="10" x2="21" y2="3" />
    <line x1="10" y1="14" x2="3" y2="21" />
  </svg>
);

const ZoomInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const ZoomOutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const MaximizeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h6v6" />
    <path d="M9 21H3v-6" />
    <path d="M21 3l-7 7" />
    <path d="M3 21l7-7" />
  </svg>
);

const TriangleIcon = () => (
  <svg viewBox="0 0 100 100" width="12" height="12">
    <polygon points="15,10 85,50 15,90" fill="currentColor" stroke="currentColor" strokeWidth="4" />
  </svg>
);

// --- ESTRUCTURA JURÍDICA E INFORMACIÓN GENERAL ---
const infoDatabase: Record<string, { title: string; content: string }> = {
  atribuciones: {
    title: 'Atribuciones e Información del Centro de Datos',
    content: `
      <p style="margin-bottom:15px;">El <strong>Centro de Datos Autonómicos</strong> es una plataforma de análisis y gestión institucional diseñada para transparentar e integrar datos clave de los Gobiernos Autónomos de Bolivia.</p>
      <h4 style="color:#00f2fe; margin-bottom:8px;">Competencias Constitucionales:</h4>
      <ul style="margin-left:20px; margin-bottom:15px; display:flex; flex-direction:column; gap:8px; list-style-type: disc;">
        <li><strong>GAD (Departamentales):</strong> Planificación del desarrollo departamental, construcción de carreteras interprovinciales, y fomento productivo regional.</li>
        <li><strong>GAM (Municipales):</strong> Gestión de servicios públicos básicos, centros de salud primaria, unidades educativas, y catastro urbano.</li>
        <li><strong>GAIOC (Indígenas):</strong> Autogobierno bajo normas y procedimientos propios, administración territorial comunaria, y preservación del patrimonio cultural.</li>
        <li><strong>GAR (Regionales):</strong> Gestión y delegación de competencias metropolitanas o de cuencas en el ámbito regional.</li>
      </ul>
    `
  },
  acerca: {
    title: 'Acerca de la Plataforma',
    content: `
      <p style="margin-bottom:15px;"><strong>Versión:</strong> 2.0.1 (Next-Generation UI)</p>
      <p style="margin-bottom:15px;">Esta herramienta interactiva funciona como un directorio estructurado visualmente para facilitar el flujo didáctico a técnicos y tomadores de decisiones constitucionales.</p>
      <p style="color:#10b981;">Diseñado por el equipo de Desarrollo e Innovación Frontend y UX/UI Senior de la Plataforma de Datos Autonómicos.</p>
    `
  }
};

// --- DEFINICIÓN DE TIPOS DE NODOS ---
interface TreeNode {
  id: string;
  label: string;
  type: 'root' | 'category' | 'level' | 'area' | 'leaf';
  icon?: string;
  tooltip?: string;
  children?: TreeNode[];
  action?: {
    type: 'video' | 'modal' | 'query' | 'pdf';
    payload: string;
  };
  hasInvitation?: boolean;
}

// --- ESTRUCTURA COMPLETA DEL ÁRBOL ---
const mapTree: TreeNode = {
  id: 'root',
  label: 'Centro de Datos Autonómicos',
  type: 'root',
  hasInvitation: true,
  children: [
    {
      id: 'guia',
      label: 'Guía de uso',
      type: 'category',
      icon: 'play',
      action: { type: 'video', payload: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' }
    },
    {
      id: 'consultas',
      label: 'Realizar Consultas',
      type: 'category',
      icon: 'database',
      hasInvitation: true,
      children: [
        {
          id: 'consultas-gad',
          label: 'GAD',
          type: 'level',
          tooltip: 'GAD: Gobierno Autónomo Departamental',
          hasInvitation: true,
          children: [
            {
              id: 'consultas-gad-fiscal',
              label: 'Fiscal',
              type: 'area',
              children: [
                { id: 'c-gad-f-rec', label: 'Recursos', type: 'leaf', icon: 'filter', action: { type: 'query', payload: 'Recursos de Fiscal de GAD' } },
                { id: 'c-gad-f-pres', label: 'Presupuesto', type: 'leaf', icon: 'filter', action: { type: 'query', payload: 'Presupuesto de Fiscal de GAD' } }
              ]
            },
            {
              id: 'consultas-gad-mineria',
              label: 'Minería',
              type: 'area',
              children: [
                { id: 'c-gad-m-rec', label: 'Recursos', type: 'leaf', icon: 'filter', action: { type: 'query', payload: 'Recursos de Minería de GAD' } },
                { id: 'c-gad-m-pres', label: 'Presupuesto', type: 'leaf', icon: 'filter', action: { type: 'query', payload: 'Presupuesto de Minería de GAD' } }
              ]
            },
            {
              id: 'consultas-gad-genero',
              label: 'Género',
              type: 'area',
              children: [
                { id: 'c-gad-g-rec', label: 'Recursos', type: 'leaf', icon: 'filter', action: { type: 'query', payload: 'Recursos de Género de GAD' } },
                { id: 'c-gad-g-pres', label: 'Presupuesto', type: 'leaf', icon: 'filter', action: { type: 'query', payload: 'Presupuesto de Género de GAD' } }
              ]
            },
            {
              id: 'consultas-gad-salud',
              label: 'Salud',
              type: 'area',
              children: [
                { id: 'c-gad-s-rec', label: 'Recursos', type: 'leaf', icon: 'filter', action: { type: 'query', payload: 'Recursos de Salud de GAD' } },
                { id: 'c-gad-s-pres', label: 'Presupuesto', type: 'leaf', icon: 'filter', action: { type: 'query', payload: 'Presupuesto de Salud de GAD' } }
              ]
            }
          ]
        },
        {
          id: 'consultas-gam',
          label: 'GAM',
          type: 'level',
          tooltip: 'GAM: Gobierno Autónomo Municipal',
          children: [
            {
              id: 'consultas-gam-fiscal',
              label: 'Fiscal',
              type: 'area',
              children: [
                { id: 'c-gam-f-rec', label: 'Recursos', type: 'leaf', icon: 'filter', action: { type: 'query', payload: 'Recursos de Fiscal de GAM' } },
                { id: 'c-gam-f-pres', label: 'Presupuesto', type: 'leaf', icon: 'filter', action: { type: 'query', payload: 'Presupuesto de Fiscal de GAM' } }
              ]
            },
            {
              id: 'consultas-gam-salud',
              label: 'Salud',
              type: 'area',
              children: [
                { id: 'c-gam-s-rec', label: 'Recursos', type: 'leaf', icon: 'filter', action: { type: 'query', payload: 'Recursos de Salud de GAM' } },
                { id: 'c-gam-s-pres', label: 'Presupuesto', type: 'leaf', icon: 'filter', action: { type: 'query', payload: 'Presupuesto de Salud de GAM' } }
              ]
            }
          ]
        },
        {
          id: 'consultas-gaioc',
          label: 'GAIOC',
          type: 'level',
          tooltip: 'GAIOC: Gobierno Autónomo Indígena Originario Campesino',
          children: [
            {
              id: 'consultas-gaioc-fiscal',
              label: 'Fiscal',
              type: 'area',
              children: [
                { id: 'c-gaioc-f-rec', label: 'Recursos', type: 'leaf', icon: 'filter', action: { type: 'query', payload: 'Recursos de Fiscal de GAIOC' } }
              ]
            }
          ]
        },
        {
          id: 'consultas-gar',
          label: 'GAR',
          type: 'level',
          tooltip: 'GAR: Gobierno Autónomo Regional',
          children: [
            {
              id: 'consultas-gar-fiscal',
              label: 'Fiscal',
              type: 'area',
              children: [
                { id: 'c-gar-f-rec', label: 'Recursos', type: 'leaf', icon: 'filter', action: { type: 'query', payload: 'Recursos de Fiscal de GAR' } }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'fichas',
      label: 'Fichas Sectoriales',
      type: 'category',
      icon: 'folder',
      hasInvitation: true,
      children: [
        {
          id: 'fichas-gad',
          label: 'GAD',
          type: 'level',
          tooltip: 'GAD: Gobierno Autónomo Departamental',
          children: [
            {
              id: 'fichas-gad-fiscal',
              label: 'Fiscal',
              type: 'area',
              children: [
                { id: 'f-gad-f-pdf', label: 'Recursos (PDF)', type: 'leaf', icon: 'pdf', action: { type: 'pdf', payload: 'Ficha Fiscal GAD.pdf' } }
              ]
            }
          ]
        },
        {
          id: 'fichas-gam',
          label: 'GAM',
          type: 'level',
          tooltip: 'GAM: Gobierno Autónomo Municipal',
          children: [
            {
              id: 'fichas-gam-salud',
              label: 'Salud',
              type: 'area',
              children: [
                { id: 'f-gam-s-pdf', label: 'Presupuesto (PDF)', type: 'leaf', icon: 'pdf', action: { type: 'pdf', payload: 'Ficha Salud Municipal.pdf' } }
              ]
            }
          ]
        },
        {
          id: 'fichas-gaioc',
          label: 'GAIOC',
          type: 'level',
          tooltip: 'GAIOC: Gobierno Autónomo Indígena Originario Campesino',
          children: [
            {
              id: 'fichas-gaioc-justicia',
              label: 'Justicia Indígena',
              type: 'area',
              children: [
                { id: 'f-gaioc-j-pdf', label: 'Recursos (PDF)', type: 'leaf', icon: 'pdf', action: { type: 'pdf', payload: 'Ficha GAIOC Jurisdicción.pdf' } }
              ]
            }
          ]
        },
        {
          id: 'fichas-gar',
          label: 'GAR',
          type: 'level',
          tooltip: 'GAR: Gobierno Autónomo Regional',
          children: [
            {
              id: 'fichas-gar-territorio',
              label: 'Territorio',
              type: 'area',
              children: [
                { id: 'f-gar-t-pdf', label: 'Presupuesto (PDF)', type: 'leaf', icon: 'pdf', action: { type: 'pdf', payload: 'Ficha GAR Desarrollo.pdf' } }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'atribuciones-info',
      label: 'Atribuciones e información',
      type: 'category',
      icon: 'info',
      action: { type: 'modal', payload: 'atribuciones' }
    },
    {
      id: 'acerca-de',
      label: 'Acerca de.',
      type: 'category',
      icon: 'help',
      action: { type: 'modal', payload: 'acerca' }
    }
  ]
};

// --- COMPONENTE PRINCIPAL ---
interface MapaDeContenidosProps {
  onClose: (e: React.MouseEvent) => void;
}

interface ToastMessage {
  id: number;
  text: string;
  type: 'query' | 'pdf';
}

const MapaDeContenidos: React.FC<MapaDeContenidosProps> = ({ onClose }) => {
  // --- ESTADOS DE REACT ---
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    root: true,
    consultas: false,
    fichas: false,
  });
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 50, y: 120 });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modales
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoKey, setInfoKey] = useState('');

  // Notificaciones
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastIdRef = useRef(0);

  // Conexiones SVG
  const [connections, setConnections] = useState<{ d: string; isHighlight: boolean }[]>([]);

  // Referencias para Panning/Drag y medición de elementos
  const viewportRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLElement | null>>({});
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- AYUDANTE DE BÚSQUEDA ---
  const isMatchingSearch = (node: TreeNode, query: string): boolean => {
    if (!query) return false;
    const q = query.toLowerCase();
    if (node.label.toLowerCase().includes(q)) return true;
    if (node.tooltip && node.tooltip.toLowerCase().includes(q)) return true;
    return false;
  };

  const hasMatchingDescendant = (node: TreeNode, query: string): boolean => {
    if (!node.children) return false;
    return node.children.some(child => 
      isMatchingSearch(child, query) || hasMatchingDescendant(child, query)
    );
  };

  // --- TRAZADO DINÁMICO DE CONEXIONES ---
  const calculatePaths = () => {
    if (!boardRef.current) return;
    const boardRect = boardRef.current.getBoundingClientRect();
    const paths: { d: string; isHighlight: boolean }[] = [];

    const traverseAndDraw = (node: TreeNode) => {
      const parentEl = nodeRefs.current[node.id];
      const isExpanded = expandedNodes[node.id];

      if (parentEl && isExpanded && node.children) {
        node.children.forEach(child => {
          const childEl = nodeRefs.current[child.id];
          if (parentEl && childEl) {
            const pRect = parentEl.getBoundingClientRect();
            const cRect = childEl.getBoundingClientRect();

            // Corregir escala de zoom actual
            const x1 = (pRect.right - boardRect.left) / zoomScale;
            const y1 = (pRect.top + pRect.height / 2 - boardRect.top) / zoomScale;

            const x2 = (cRect.left - boardRect.left) / zoomScale;
            const y2 = (cRect.top + cRect.height / 2 - boardRect.top) / zoomScale;

            const offset = Math.min(60, Math.abs(x2 - x1) * 0.45);
            const d = `M ${x1} ${y1} C ${x1 + offset} ${y1}, ${x2 - offset} ${y2}, ${x2} ${y2}`;

            const isHighlight = searchQuery ? (isMatchingSearch(child, searchQuery) || hasMatchingDescendant(child, searchQuery)) : false;

            paths.push({ d, isHighlight });
          }
          traverseAndDraw(child);
        });
      }
    };

    traverseAndDraw(mapTree);
    setConnections(paths);
  };

  // Recalcular conexiones al mutar el estado o redimensionar
  useEffect(() => {
    let rafId = requestAnimationFrame(calculatePaths);
    return () => cancelAnimationFrame(rafId);
  }, [expandedNodes, zoomScale, panOffset, searchQuery]);

  useEffect(() => {
    const handleResize = () => {
      calculatePaths();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [expandedNodes, zoomScale]);

  // Cerrar modales con escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setVideoModalOpen(false);
        setInfoModalOpen(false);
        if (videoRef.current) {
          videoRef.current.pause();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- AUTO-EXPANSION AL BUSCAR ---
  useEffect(() => {
    if (!searchQuery) return;
    const newExpanded = { ...expandedNodes };
    let changed = false;

    const checkAndExpand = (node: TreeNode): boolean => {
      let childMatched = false;
      if (node.children) {
        node.children.forEach(child => {
          const matched = isMatchingSearch(child, searchQuery) || checkAndExpand(child);
          if (matched) {
            childMatched = true;
          }
        });
      }
      if (childMatched && !newExpanded[node.id]) {
        newExpanded[node.id] = true;
        changed = true;
      }
      return childMatched || isMatchingSearch(node, searchQuery);
    };

    checkAndExpand(mapTree);

    if (changed) {
      setExpandedNodes(newExpanded);
    }
  }, [searchQuery]);

  // --- MANEJADORES DE INTERACCIONES DE PANNING/DRAG ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest('.tree-node') ||
      (e.target as HTMLElement).closest('.invitation-btn') ||
      (e.target as HTMLElement).closest('.action-btn') ||
      (e.target as HTMLElement).closest('.modal-container') ||
      (e.target as HTMLElement).closest('.toolbar-controls')
    ) return;
    isDragging.current = true;
    if (viewportRef.current) viewportRef.current.style.cursor = 'grabbing';
    dragStart.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || window.innerWidth <= 991) return;
    setPanOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (viewportRef.current) viewportRef.current.style.cursor = 'grab';
  };

  // Soporte Touch en móvil
  const handleTouchStart = (e: React.TouchEvent) => {
    if (
      (e.target as HTMLElement).closest('.tree-node') ||
      (e.target as HTMLElement).closest('.invitation-btn') ||
      (e.target as HTMLElement).closest('.action-btn') ||
      (e.target as HTMLElement).closest('.modal-container')
    ) return;
    isDragging.current = true;
    dragStart.current = {
      x: e.touches[0].clientX - panOffset.x,
      y: e.touches[0].clientY - panOffset.y,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || window.innerWidth <= 991) return;
    setPanOffset({
      x: e.touches[0].clientX - dragStart.current.x,
      y: e.touches[0].clientY - dragStart.current.y,
    });
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  // --- CONTROLES DE ZOOM ---
  const zoomIn = () => setZoomScale(s => Math.min(2, s + 0.1));
  const zoomOut = () => setZoomScale(s => Math.max(0.5, s - 0.1));
  const zoomReset = () => {
    setZoomScale(1);
    setPanOffset({ x: 50, y: 120 });
  };

  // --- BOTONES GLOBALES DE EXPANSIÓN ---
  const expandAll = () => {
    const newExpanded: Record<string, boolean> = {};
    const traverse = (node: TreeNode) => {
      newExpanded[node.id] = true;
      if (node.children) node.children.forEach(traverse);
    };
    traverse(mapTree);
    setExpandedNodes(newExpanded);
  };

  const collapseAll = () => {
    setExpandedNodes({
      root: true,
      consultas: false,
      fichas: false,
    });
  };

  // --- SISTEMA DE TOASTS ---
  const addToast = (text: string, type: 'query' | 'pdf') => {
    const id = toastIdRef.current++;
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // --- RESPUESTA CLIC EN NODOS ---
  const handleNodeClick = (node: TreeNode, e: React.MouseEvent) => {
    e.preventDefault();

    if (node.action) {
      if (node.action.type === 'video') {
        setVideoUrl(node.action.payload);
        setVideoModalOpen(true);
      } else if (node.action.type === 'modal') {
        setInfoKey(node.action.payload);
        setInfoModalOpen(true);
      } else if (node.action.type === 'query') {
        addToast(`Procesando consulta: [${node.action.payload}]`, 'query');
      } else if (node.action.type === 'pdf') {
        addToast(`Generando y descargando documento: [${node.action.payload}]`, 'pdf');
      }
    } else if (node.children && node.children.length > 0) {
      setExpandedNodes(prev => ({
        ...prev,
        [node.id]: !prev[node.id],
      }));
    }
  };

  const handleInvitationClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = { ...expandedNodes };
    newExpanded[nodeId] = true;

    // Expandir también el nivel siguiente inmediato para revelar las sub-opciones
    const findAndExpandNext = (n: TreeNode) => {
      if (n.id === nodeId && n.children) {
        n.children.forEach(c => {
          newExpanded[c.id] = true;
        });
      } else if (n.children) {
        n.children.forEach(findAndExpandNext);
      }
    };
    findAndExpandNext(mapTree);

    setExpandedNodes(newExpanded);
    addToast("Nivel expandido. Explora las nuevas secciones.", 'query');

    // Desplazamiento sutil en desktop
    if (window.innerWidth > 991) {
      setPanOffset(p => ({ x: p.x - 100, y: p.y }));
    }
  };

  // Mapear iconos
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'root': return <DatabaseIcon />;
      case 'play': return <PlayIcon />;
      case 'database': return <DatabaseIcon />;
      case 'folder': return <FolderIcon />;
      case 'filter': return <SlidersIcon />;
      case 'pdf': return <PdfIcon />;
      case 'info': return <InfoIcon />;
      case 'help': return <HelpIcon />;
      default: return <FolderIcon />;
    }
  };

  // --- MUESTRA RECURSIVA DE NODOS ---
  const renderBranch = (node: TreeNode) => {
    const isExpanded = expandedNodes[node.id] || false;
    const hasChildren = node.children && node.children.length > 0;
    
    // Filtro de búsqueda
    const isMatch = searchQuery ? isMatchingSearch(node, searchQuery) : false;
    const isFade = searchQuery && !isMatch && !hasMatchingDescendant(node, searchQuery);

    const nodeJSX = (
      <button
        ref={el => { nodeRefs.current[node.id] = el; }}
        className={`tree-node node-${node.type} ${isMatch ? 'search-match' : ''} ${isFade ? 'search-fade' : ''}`}
        onClick={(e) => handleNodeClick(node, e)}
      >
        {getIconComponent(node.icon || node.type)}
        <span>{node.label}</span>
        {hasChildren && (
          <span className={`arrow-indicator ${isExpanded ? 'rotated' : ''}`}>
            <ChevronRightIcon />
          </span>
        )}
      </button>
    );

    return (
      <div key={node.id} className="tree-branch" data-id={node.id}>
        <div className="tree-node-wrapper">
          {node.tooltip ? (
            <Tooltip
              title={node.tooltip}
              arrow
              placement="top"
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: 'rgba(11, 17, 30, 0.95)',
                    color: '#fff',
                    boxShadow: '0 8px 32px rgba(0, 242, 254, 0.15)',
                    borderRadius: 2,
                    p: 1.5,
                    fontFamily: 'sinkin_sans200_x_light',
                    border: '1px solid rgba(0, 242, 254, 0.3)',
                    backdropFilter: 'blur(8px)',
                    maxWidth: 250,
                    fontSize: '13px'
                  }
                }
              }}
            >
              {nodeJSX}
            </Tooltip>
          ) : nodeJSX}
          
          {node.hasInvitation && (
            <button
              className="invitation-btn pulse"
              onClick={(e) => handleInvitationClick(node.id, e)}
              title="Explorar siguiente nivel"
            >
              <TriangleIcon />
            </button>
          )}
        </div>

        {hasChildren && (
          <div className={`tree-children ${isExpanded ? '' : 'collapsed'}`}>
            {node.children!.map(child => renderBranch(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* CABECERA INTERNA DEL MAPA */}
      <div className="map-header">
        <div className="map-brand" onClick={onClose} style={{ cursor: 'pointer' }}>
          <IconButton sx={{ color: '#00f2fe', mr: 1.5, border: '1px solid rgba(0,242,254,0.2)' }}>
            <BackIcon />
          </IconButton>
          <div>
            <h3>Mapa de Contenidos</h3>
            <p>Centro de Datos Autonómicos</p>
          </div>
        </div>

        <div className="map-search-bar">
          <SearchIcon />
          <input
            type="text"
            placeholder="Buscar nivel, área o recurso..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              <CloseIcon />
            </button>
          )}
        </div>

        <div className="map-global-actions">
          <button className="action-btn" onClick={expandAll}>
            <ExpandIcon />
            <span>Expandir Todo</span>
          </button>
          <button className="action-btn" onClick={collapseAll}>
            <ShrinkIcon />
            <span>Colapsar Todo</span>
          </button>
        </div>
      </div>

      {/* CONTROLES FLOTANTES ZOOM (DESKTOP) */}
      <div className="toolbar-controls">
        <button className="control-btn" onClick={zoomIn} title="Acercar">
          <ZoomInIcon />
        </button>
        <button className="control-btn" onClick={zoomOut} title="Alejar">
          <ZoomOutIcon />
        </button>
        <button className="control-btn" onClick={zoomReset} title="Restablecer">
          <MaximizeIcon />
        </button>
      </div>

      {/* LIENZO DE NAVEGACIÓN Y ARBOL */}
      <div
        ref={viewportRef}
        className="tree-viewport"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={boardRef}
          className="tree-board"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
            transformOrigin: '0 0',
          }}
        >
          {/* Conectores SVG Bezier */}
          <svg className="connections-svg">
            {connections.map((conn, idx) => (
              <path
                key={idx}
                d={conn.d}
                className={`connection-line ${conn.isHighlight ? 'highlight' : ''}`}
              />
            ))}
          </svg>

          {/* Render del Nodo Raíz y sus hijos */}
          {renderBranch(mapTree)}
        </div>
      </div>

      {/* MODAL DE VIDEO (GUÍA DE USO) */}
      {videoModalOpen && (
        <div className="modal-overlay active" onClick={() => { setVideoModalOpen(false); if(videoRef.current) videoRef.current.pause(); }}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Guía de Uso - Centro de Datos</h3>
              <button className="modal-close" onClick={() => { setVideoModalOpen(false); if(videoRef.current) videoRef.current.pause(); }}>
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <div className="video-wrapper">
                <video ref={videoRef} controls preload="metadata">
                  <source src={videoUrl} type="video/mp4" />
                  Tu navegador no soporta el reproductor de video HTML5.
                </video>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INFORMATIVO (ATRIBUCIONES / ACERCA DE) */}
      {infoModalOpen && (
        <div className="modal-overlay active" onClick={() => setInfoModalOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{infoDatabase[infoKey]?.title}</h3>
              <button className="modal-close" onClick={() => setInfoModalOpen(false)}>
                <CloseIcon />
              </button>
            </div>
            <div
              className="modal-body info-modal-body"
              dangerouslySetInnerHTML={{ __html: infoDatabase[infoKey]?.content || '' }}
            />
          </div>
        </div>
      )}

      {/* TOASTS DE ALERTA */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="toast show" style={{ borderLeftColor: toast.type === 'pdf' ? '#10b981' : '#00f2fe' }}>
            {toast.type === 'pdf' ? <PdfIcon /> : <SlidersIcon />}
            <span>{toast.text}</span>
          </div>
        ))}
      </div>

      {/* ESTILOS CSS MEDIANTE STYLED JSX */}
      <style jsx global>{`
        :root {
          --bg-main: #060b13;
          --bg-panel: rgba(13, 20, 35, 0.7);
          --bg-card: rgba(19, 29, 51, 0.85);
          --border-color: rgba(0, 242, 254, 0.15);
          --border-glow: rgba(0, 242, 254, 0.35);
          --primary: #00f2fe;
          --secondary: #10b981;
          --accent: #3b82f6;
          --text-main: #f3f4f6;
          --text-muted: #9ca3af;
          --transition-fast: 0.2s ease;
          --transition-normal: 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          --font-title: 'Outfit', sans-serif;
          --font-body: 'Plus Jakarta Sans', sans-serif;
        }

        body[data-theme='light'] {
          --bg-main: #f0fdf4;
          --bg-panel: rgba(255, 255, 255, 0.65);
          --bg-card: rgba(255, 255, 255, 0.85);
          --border-color: rgba(8, 176, 167, 0.2);
          --border-glow: rgba(8, 176, 167, 0.4);
          --primary: #08B0A7;
          --secondary: #10b981;
          --accent: #2563eb;
          --text-main: #0f172a;
          --text-muted: #475569;
        }

        .map-header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 85px;
          background: rgba(6, 11, 19, 0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(0, 242, 254, 0.15);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          z-index: 10100;
        }

        .map-brand {
          display: flex;
          align-items: center;
        }

        .map-brand h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }

        .map-brand p {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.75rem;
          color: #00f2fe;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin: 2px 0 0 0;
        }

        /* Buscador */
        .map-search-bar {
          position: relative;
          width: 380px;
          display: flex;
          align-items: center;
        }

        .map-search-bar :global(svg) {
          position: absolute;
          left: 15px;
          color: #9ca3af;
        }

        .map-search-bar input {
          width: 100%;
          background: rgba(13, 20, 35, 0.6);
          border: 1px solid rgba(0, 242, 254, 0.15);
          border-radius: 30px;
          padding: 10px 40px 10px 45px;
          color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.2s ease;
        }

        .map-search-bar input:focus {
          border-color: #00f2fe;
          box-shadow: 0 0 15px rgba(0, 242, 254, 0.25);
          background: rgba(13, 20, 35, 0.95);
        }

        .clear-search {
          position: absolute;
          right: 15px;
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .clear-search:hover {
          color: #fff;
        }

        .map-global-actions {
          display: flex;
          gap: 12px;
        }

        .action-btn {
          background: rgba(19, 29, 51, 0.5);
          border: 1px solid rgba(0, 242, 254, 0.15);
          border-radius: 10px;
          padding: 10px 18px;
          color: #f3f4f6;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.85rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          border-color: #00f2fe;
          background: rgba(19, 29, 51, 0.85);
          color: #00f2fe;
        }

        /* Controles de Zoom Flotantes */
        .toolbar-controls {
          position: fixed;
          bottom: 30px;
          right: 30px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 10100;
        }

        .control-btn {
          width: 48px;
          height: 48px;
          background: rgba(13, 20, 35, 0.8);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(0, 242, 254, 0.2);
          border-radius: 14px;
          color: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }

        .control-btn:hover {
          border-color: #00f2fe;
          color: #00f2fe;
          transform: translateY(-2px);
          box-shadow: 0 0 12px rgba(0, 242, 254, 0.35);
        }

        /* Viewport & Tablero del mapa */
        .tree-viewport {
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          position: absolute;
          top: 0;
          left: 0;
          cursor: grab;
          z-index: 1000;
          background-color: var(--bg-main);
        }

        .tree-viewport:active {
          cursor: grabbing;
        }

        .tree-board {
          position: absolute;
          padding: 180px 100px;
          display: flex;
          align-items: center;
          min-width: max-content;
          min-height: max-content;
        }

        /* SVG curvas de conexión */
        .connections-svg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: -1;
        }

        .connection-line {
          fill: none;
          stroke: rgba(0, 242, 254, 0.2);
          stroke-width: 1.5px;
          transition: stroke-dashoffset 0.5s ease;
        }

        .connection-line.highlight {
          stroke: #00f2fe;
          stroke-width: 2.5px;
          filter: drop-shadow(0 0 4px #00f2fe);
        }

        /* Nodos y estructura */
        .tree-branch {
          display: flex;
          flex-direction: row;
          align-items: center;
          position: relative;
        }

        .tree-node-wrapper {
          display: flex;
          align-items: center;
          position: relative;
          z-index: 5;
        }

        .tree-children {
          display: flex;
          flex-direction: column;
          gap: 25px;
          padding-left: 80px;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: left center;
          opacity: 1;
          max-width: 5000px;
        }

        .tree-children.collapsed {
          opacity: 0;
          max-width: 0;
          overflow: hidden;
          padding-left: 0;
          transform: scale(0.9) translateX(-25px);
          pointer-events: none;
        }

        .tree-node {
          background: rgba(13, 20, 35, 0.7);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(0, 242, 254, 0.15);
          border-radius: 14px;
          padding: 13px 20px;
          color: #f3f4f6;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 500;
          font-size: 0.95rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          white-space: nowrap;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
          user-select: none;
          position: relative;
        }

        .tree-node:hover {
          transform: translateY(-2px);
          border-color: #00f2fe;
          box-shadow: 0 6px 20px rgba(0, 242, 254, 0.2);
          background: rgba(19, 29, 51, 0.85);
        }

        .tree-node :global(svg) {
          color: #00f2fe;
        }

        /* Colores específicos de los nodos */
        .node-root {
          background: linear-gradient(135deg, rgba(13, 20, 35, 0.95), rgba(16, 185, 129, 0.15));
          border-color: #10b981;
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 1.1rem;
          padding: 16px 26px;
          box-shadow: 0 0 25px rgba(16, 185, 129, 0.2);
        }

        .node-root:hover {
          border-color: #10b981;
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.35);
        }

        .node-root :global(svg) {
          color: #10b981;
        }

        .node-category {
          border-left: 4px solid #00f2fe;
        }

        .node-level {
          border-left: 4px solid #3b82f6;
        }

        .node-area {
          border-left: 4px solid #10b981;
          font-size: 0.9rem;
        }

        .node-leaf {
          background: rgba(16, 185, 129, 0.05);
          border: 1px dashed rgba(16, 185, 129, 0.3);
          border-radius: 10px;
          font-size: 0.85rem;
          padding: 10px 16px;
        }

        .node-leaf:hover {
          background: rgba(16, 185, 129, 0.15);
          border-color: #10b981;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
        }

        .node-leaf :global(svg) {
          color: #10b981;
        }

        .arrow-indicator {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-left: 8px;
          transition: transform 0.3s ease;
        }

        .arrow-indicator.rotated {
          transform: rotate(90deg);
        }

        /* Botón de invitación (triángulo) */
        .invitation-btn {
          width: 24px;
          height: 24px;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 10px;
          outline: none;
          padding: 0;
          color: #00f2fe;
        }

        .invitation-btn.pulse {
          animation: neonPulse 1.8s infinite alternate;
        }

        @keyframes neonPulse {
          0% {
            opacity: 0.4;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1.1);
            filter: drop-shadow(0 0 6px #00f2fe);
          }
        }

        .invitation-btn:hover {
          color: #10b981;
        }

        /* Resaltados de búsqueda */
        .tree-node.search-match {
          border-color: #00f2fe !important;
          box-shadow: 0 0 20px rgba(0, 242, 254, 0.6) !important;
          background: rgba(13, 20, 35, 0.95) !important;
          animation: highlightPulse 1.5s infinite alternate;
        }

        .tree-node.search-fade {
          opacity: 0.35;
        }

        @keyframes highlightPulse {
          0% { box-shadow: 0 0 10px rgba(0, 242, 254, 0.4); }
          100% { box-shadow: 0 0 22px rgba(0, 242, 254, 0.85); }
        }

        /* Modales */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(4, 8, 15, 0.85);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transition: all 0.4s ease;
          z-index: 20000;
        }

        .modal-overlay.active {
          opacity: 1;
          visibility: visible;
        }

        .modal-container {
          background: rgba(13, 20, 35, 0.85);
          border: 1px solid rgba(0, 242, 254, 0.15);
          border-radius: 24px;
          width: 90%;
          max-width: 800px;
          overflow: hidden;
          box-shadow: 0 15px 50px rgba(0, 242, 254, 0.15);
          transform: scale(0.9);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
        }

        .modal-overlay.active .modal-container {
          transform: scale(1);
        }

        .modal-header {
          padding: 22px 30px;
          border-bottom: 1px solid rgba(0, 242, 254, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.35rem;
          font-weight: 700;
          color: #00f2fe;
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          color: #fff;
          transform: rotate(90deg);
        }

        .modal-body {
          padding: 30px;
        }

        .info-modal-body {
          max-height: 55vh;
          overflow-y: auto;
          color: #9ca3af;
          line-height: 1.6;
          font-size: 0.95rem;
        }

        /* Reproductor Video */
        .video-wrapper {
          position: relative;
          width: 100%;
          border-radius: 14px;
          overflow: hidden;
          background: #000;
          aspect-ratio: 16/9;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .video-wrapper video {
          width: 100%;
          height: 100%;
          display: block;
        }

        /* Sistema Toasts */
        .toast-container {
          position: fixed;
          bottom: 30px;
          left: 30px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 20000;
        }

        .toast {
          background: rgba(19, 29, 51, 0.9);
          border-left: 4px solid #10b981;
          border-radius: 10px;
          padding: 14px 20px;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
          transform: translateX(-150%);
          backdrop-filter: blur(8px);
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.85rem;
        }

        .toast.show {
          transform: translateX(0);
        }

        .toast :global(svg) {
          width: 18px;
          height: 18px;
        }

        /* MÓVIL Y RESPONSIVO */
        @media (max-width: 991px) {
          .map-header {
            padding: 15px 20px;
            flex-direction: column;
            height: auto;
            gap: 15px;
            position: relative;
            background: rgba(6, 11, 19, 0.95);
          }

          .map-search-bar {
            width: 100%;
          }

          .toolbar-controls {
            display: none;
          }

          .tree-viewport {
            position: relative;
            width: 100%;
            height: auto;
            cursor: default;
          }

          .tree-board {
            padding: 30px 20px;
            position: static;
            transform: none !important;
            display: block;
            min-width: 100%;
          }

          .connections-svg {
            display: none;
          }

          .tree-branch {
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
          }

          .tree-node-wrapper {
            width: 100%;
            margin-bottom: 6px;
          }

          .tree-node {
            width: 100%;
            justify-content: space-between;
          }

          .tree-children {
            width: 100%;
            padding-left: 20px;
            border-left: 2px solid rgba(0, 242, 254, 0.15);
            gap: 12px;
            margin-top: 6px;
            margin-bottom: 6px;
          }

          .tree-children.collapsed {
            max-height: 0;
            margin: 0;
            padding-left: 0;
            border: none;
          }
        }
      `}</style>
    </>
  );
};

export default MapaDeContenidos;
