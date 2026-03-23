'use client'
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet'
import L, { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { FeatureCollection, Feature } from 'geojson'
import { getDataGeneralFinal } from '@/components/map/api/apiMap'

// ─────────────────────────────────────────────────────────────────
// TIPOS
// A = Asambleísta: { n:nombre, s:sigla, g:genero, c:color, p:provincia }
// ─────────────────────────────────────────────────────────────────
interface A { n: string; s: string; g: string; c: string; p: string }
interface S { n: string; cargo: string }
interface Gan { nombre: string; sigla: string; pct: number; color: string }
interface C1v { sigla: string; nombre: string; pct1v: number; color: string }
interface SV { diferencia: number; ganador2vPct: number; candidatos1v: C1v[] }
interface DatoDepto {
  nombre: string
  cands21: { sigla: string; nombre: string; color: string }[]
  gan21: Gan | null; gan15: Gan | null
  sv: SV | null
  // 2021
  territorio21: A[]; poblacion21: A[]; indigena21: A[]; secretarios21: S[]
  // 2015
  territorio15: A[]; poblacion15: A[]; indigena15: A[]
}

const DEPTOS: Record<string, DatoDepto> = {
  '901': {
    nombre: 'Chuquisaca',
    cands21: [{ sigla: 'CST', nombre: 'Damián Condori Herrera', color: '#fda72e' }, { sigla: 'FPV', nombre: 'Jimmy González Flores', color: '#165f4c' }],
    gan21: { nombre: 'Damián Condori Herrera', sigla: 'CST', pct: 57.32, color: '#fda72e' },
    gan15: { nombre: 'Esteban Urquizo Cuellar', sigla: 'MAS-IPSP', pct: 48.91, color: '#0400ff' },
    sv: { diferencia: 17635, ganador2vPct: 57.32, candidatos1v: [{ sigla: 'CST', nombre: 'Damián Condori Herrera', pct1v: 45.62, color: '#fda72e' }, { sigla: 'MAS-IPSP', nombre: 'Juan Carlos León Rodas', pct1v: 39.13, color: '#0400ff' }] },
    territorio21: [
      { n: 'KATHERINE ELIZABETH OVANDO PALENQUE', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Belisario Boeto' },
      { n: 'CLEDYS CEREZO RUIZ', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Hernando Siles' },
      { n: 'EVERT CRUZ QUIROGA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Jaime Zudañez' },
      { n: 'VICENTA VENTURA RODRIGUEZ', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Juana Azurduy de Padilla' },
      { n: 'JUAN CUELLAR RODAS', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Luis Calvo' },
      { n: 'SANTOS RICARDO CARNICEL SERRANO', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Nor Cinti' },
      { n: 'BRAULIO JORGE ORTEGA PEREZ', s: 'CST', g: 'MASCULINO', c: '#fda72e', p: 'Oropeza' },
      { n: 'SILVIA EUGENIA GARNICA MERCADO', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Sud Cinti' },
      { n: 'FRANCISCO RENTERIA MARQUEZ', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Tomina' },
      { n: 'IDELMA LLANQUI SOLIS', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Yamparaez' }
    ],
    poblacion21: [
      { n: 'MARIA DEL PILAR RIVERO GUILLEN PINTO', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'GUSTAVO RICARDO ZARATE LOPEZ', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'VIRGILIA RAMOS AGUILAR', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'ROMAN BARRON URISTA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'ELVIRA ERQUICIA DIAZ', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'JANETH ROCIO BLANCO MARTINEZ', s: 'CST', g: 'FEMENINO', c: '#fda72e', p: '' },
      { n: 'LUIS EDSON AYLLON SALGUEIRO', s: 'CST', g: 'MASCULINO', c: '#fda72e', p: '' },
      { n: 'ELIZABET MERIDA BARRANCOS', s: 'CST', g: 'FEMENINO', c: '#fda72e', p: '' },
      { n: 'ISAC TEJERINA CARDOZO', s: 'CST', g: 'MASCULINO', c: '#fda72e', p: '' }
    ],
    indigena21: [
      { n: 'ANASTACIO FLORES PINTO', s: 'Guarani', g: 'MASCULINO', c: '#8B5E3C', p: '' },
      { n: 'RUFINO PASQUITO TARUMBARA', s: 'Guarani', g: 'MASCULINO', c: '#8B5E3C', p: '' }
    ],
    secretarios21: [
      { n: 'ADOLFO BENJAMÍN MARTÍNEZ', cargo: 'Asuntos Jurídicos' },
      { n: 'JAIRO GUTIÉRREZ ARANCIBIA', cargo: 'Medio Ambiente Y Madre Tierra' },
      { n: 'MARISABEL FIGUEROA FLORES', cargo: 'Economía Y Finanzas Públicas' },
      { n: 'MARCELO ARCIENEGA LEÓN', cargo: 'Obras Públicas Y Servicios' },
      { n: 'INOCENTA GALEÁN OCHOA', cargo: 'Desarrollo Productivo Y Economía Plural' },
      { n: 'JORGE VILLCA MISERICORDIA', cargo: 'Planificación Y Desarrollo' },
      { n: 'ELSA ORTEGA', cargo: 'Desarrollo Social' },
      { n: 'JUAN CABA CHOQUEVILLCA', cargo: 'Cultura Y Turismo' },
      { n: 'MAGUIVER ROSALES', cargo: 'Coordinación' }
    ],
    territorio15: [
      { n: 'Saturnino Edgar Apaza Machaca', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'HEYDI CAYON ATA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'DIONICIO HUAILLA ORELLANA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'JOSE ORITZ VALLEJOS', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'PAULINA LIMACHI PADILLA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'ESTELA URIONA HUANCA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'SANDRA SIÑANI FERRUFINO', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'VICTOR HUGO SANCHEZ MORALES', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'GREGORIO VELA VARGAS', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'LUCIANO QUISPE', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'DORA REIVERA LLANOS', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' }
    ],
    poblacion15: [
      { n: 'HILDA SAAVEDRA SERRANO', s: 'CST', g: 'FEMENINO', c: '#fda72e', p: '' },
      { n: 'EUSEBIO CORDERO RODRGUEZ', s: 'CST', g: 'MASCULINO', c: '#fda72e', p: '' },
      { n: 'ALEJANDRA LIMACHI QUISPE', s: 'CST', g: 'FEMENINO', c: '#fda72e', p: '' },
      { n: 'ELSA MARIA GUEVERA AGUIRRE', s: 'FRI', g: 'FEMENINO', c: '#fe0003', p: '' },
      { n: 'MARINA MARTHA BENITEZ ESTRADA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'PABLO PEREZ PETRINOVIC', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'GRISELDA BRITO CARAZANI', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'JUAN MANUEL ALFARO VEGA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'CIPRIANA ACUÑA LLANOS', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' }
    ],
    indigena15: [
      { n: 'ROXANA LINARES CACERES', s: 'GUARANÃ', g: 'FEMENINO', c: '#888888', p: '' },
      { n: 'ADEMAR GARCIA CHAIRE', s: 'GUARANÃ', g: 'MASCULINO', c: '#888888', p: '' }
    ],
  },
  '902': {
    nombre: 'La Paz',
    cands21: [{ sigla: 'J.A. LLALLA.L.P.', nombre: 'Santos Quispe Quispe', color: '#f90403' }, { sigla: 'MAS-IPSP', nombre: 'Franklin R. Flores Córdova', color: '#0400ff' }, { sigla: 'MTS', nombre: 'Félix Patzy Paco', color: '#004026' }, { sigla: 'C-A', nombre: 'Mateo Laura Canqui', color: '#eb6724' }, { sigla: 'UNIDOS', nombre: 'Santiago Quenta Ninachoque', color: '#6f03be' }, { sigla: 'SOL.BO', nombre: 'Beatriz Álvarez Jahuira', color: '#feed00' }, { sigla: 'UN', nombre: 'Claudia Gilda Bravo Terrazas', color: '#fbc501' }, { sigla: 'PAN-BOL', nombre: 'Orlando Quispe Álvarez', color: '#fb0303' }, { sigla: 'ASP', nombre: 'Julio Tito Condori', color: '#01a949' }, { sigla: 'PBCSP', nombre: 'Rafael Quispe Flores', color: '#e42a2b' }, { sigla: 'MPS', nombre: 'Federico Zelada Bilbao', color: '#ffcc00' }, { sigla: 'V', nombre: 'Juan Germán Choque Apaza', color: '#fe0000' }, { sigla: 'PDC', nombre: 'Ceferino Rufo Calle Parra', color: '#777' }, { sigla: 'FPV', nombre: 'Franklin Gutiérrez López', color: '#165f4c' }],
    gan21: { nombre: 'Santos Quispe Quispe', sigla: 'J.A. LLALLA.L.P.', pct: 55.23, color: '#f90403' },
    gan15: { nombre: 'Félix Patzy Paco', sigla: 'SOL.BO', pct: 50.09, color: '#feed00' },
    sv: { diferencia: 226089, ganador2vPct: 55.23, candidatos1v: [{ sigla: 'MAS-IPSP', nombre: 'Franklin R. Flores Córdova', pct1v: 39.7, color: '#0400ff' }, { sigla: 'J.A. LLALLA.L.P.', nombre: 'Santos Quispe Quispe', pct1v: 25.18, color: '#f90403' }] },
    territorio21: [
      { n: 'LORENA BEYUMA NAVI', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Abel Iturralde' },
      { n: '(POR DEFINIR)', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Aroma' },
      { n: 'ENRIQUE HUAQUI MUNI', s: 'MTS', g: 'MASCULINO', c: '#004026', p: 'Bautista Saavedra' },
      { n: 'LUIS SURCO CAÑASACA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Caranavi' },
      { n: 'RIGOBERTO RAMOS SURCO', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Eliodoro Camacho' },
      { n: 'RICARDO FERNANDO CESPEDES CHAVEZ', s: 'SOL.BO', g: 'MASCULINO', c: '#feed00', p: 'Franz Tamayo' },
      { n: 'GERMAN ALEJANDRO GUTIERREZ GARCIA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Gualberto Villarroel' },
      { n: 'WILFREDO CHINCHE QUISPE', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Ingavi' },
      { n: 'SILVER ANTONY MARTINEZ CALLIZAYA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Inquisivi' },
      { n: '(POR DEFINIR)', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'José Manuel Pando' },
      { n: 'AURELIO MACHICADO COAQUIRA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Larecaja' },
      { n: '(POR DEFINIR)', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Loayza' },
      { n: 'VICTOR HUGO CASTRO CASTRO', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Los Andes' },
      { n: '(POR DEFINIR)', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Manco Kapac' },
      { n: 'HERIBERTO FLORES YUJRA', s: 'J.A. LLALLA.L.P.', g: 'MASCULINO', c: '#f90403', p: 'Muñecas' },
      { n: 'ALEX GIOBANI ARTEAGA MAMANI', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Nor Yungas' },
      { n: 'ANGELINO LIMACHI TORREZ', s: 'J.A. LLALLA.L.P.', g: 'MASCULINO', c: '#f90403', p: 'Omasuyos' },
      { n: 'SILVERIA CHOQUE HUANCA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Pacajes' },
      { n: 'YHANET CADENA MAMANI', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Pedro Domingo Murillo' },
      { n: '(POR DEFINIR)', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Sud Yungas' }
    ],
    poblacion21: [
      { n: 'JANET RODRIGUEZ VALENCIA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'ERNESTO PACO NINA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'VIRGINIA PELAGIA MONASTERIOS CHUI', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'LUIS RAMOS ESPEJO', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'ROSMERI BERNAL MAMANI', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'MARIO SILVA COYA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'CLEMENTINA QUISPE USNAYO', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'RAUL EDWIN  POMA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'ANA ALIAGA COPA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'LEOPOLDO RICHARD CHUI TORREZ', s: 'J.A. LLALLA.L.P.', g: 'MASCULINO', c: '#f90403', p: '' },
      { n: 'ANA MARIA SALGADO TAPIA', s: 'J.A. LLALLA.L.P.', g: 'FEMENINO', c: '#f90403', p: '' },
      { n: 'LINO MAMANI QUISPE', s: 'J.A. LLALLA.L.P.', g: 'MASCULINO', c: '#f90403', p: '' },
      { n: 'AIDA QUISPE CALLE', s: 'J.A. LLALLA.L.P.', g: 'FEMENINO', c: '#f90403', p: '' },
      { n: 'RAMIRO ELIO CHURATA MAMANI', s: 'J.A. LLALLA.L.P.', g: 'MASCULINO', c: '#f90403', p: '' },
      { n: 'MARIBEL IRENE CHIPANA PACORICONA', s: 'J.A. LLALLA.L.P.', g: 'FEMENINO', c: '#f90403', p: '' },
      { n: 'SAMANTA CONCEPCION CORONADO RAMIREZ', s: 'PBCSP', g: 'FEMENINO', c: '#e42a2b', p: '' },
      { n: 'ISRAEL ANGEL ALANOCA CHAVEZ', s: 'PBCSP', g: 'MASCULINO', c: '#e42a2b', p: '' },
      { n: 'MARIA ESTHER GONGORA MIRANDA', s: 'PBCSP', g: 'FEMENINO', c: '#e42a2b', p: '' },
      { n: 'FERNANDO CONDORI CHAMBI', s: 'PBCSP', g: 'MASCULINO', c: '#e42a2b', p: '' },
      { n: 'REYNA ANDREA ECHEVERRIA AVERANGA', s: 'PBCSP', g: 'FEMENINO', c: '#e42a2b', p: '' }
    ],
    indigena21: [
      { n: 'HERIBERTO MAZA SEMO', s: 'Mosetén', g: 'MASCULINO', c: '#8B5E3C', p: '' },
      { n: 'ARTURO DEHESA GARCÍA', s: 'Afroboliviano', g: 'MASCULINO', c: '#8B5E3C', p: '' },
      { n: 'WALTER PINTO MOLLINEDO', s: 'Leco', g: 'MASCULINO', c: '#8B5E3C', p: '' },
      { n: '(POR DEFINIR)', s: 'Kallawaya', g: 'MASCULINO', c: '#8B5E3C', p: '' },
      { n: 'CHANITO MATAHUA HUARI', s: 'Tacana y Araona', g: 'MASCULINO', c: '#8B5E3C', p: '' }
    ],
    secretarios21: [
      { n: 'GREGORIO HUANCA KILCA', cargo: 'Secretario General' },
      { n: 'NATALY SILES ESPINOZA', cargo: 'Economía Y Finanzas' },
      { n: 'OLIVIA ARRATIA ESPINAL', cargo: 'Asuntos Jurídicos' },
      { n: 'REYNALDO CUSSI CHOQUE', cargo: 'Infraestructura Productiva Y Obras Públicas' },
      { n: 'RICARDO MAMANI ORTEGA', cargo: 'Planificación Del Desarrollo' },
      { n: 'LEYLA CAROLINA CASTRO REQUENA', cargo: 'Turismo Y Cultura' },
      { n: 'FREDDY CRUZ LAURA', cargo: 'Derechos De La Madre Tierra' },
      { n: 'ORLANDO CALLISAYA COPANA', cargo: 'Desarrollo Económico Y Transformación Industrial' },
      { n: 'JUAN POMA PUÑA', cargo: 'Minería Y Metalurgia' },
      { n: 'ZENÓN QUISPE FERNÁNDEZ', cargo: 'Desarrollo Social Y Comunitario' }
    ],
    territorio15: [
      { n: 'Wilfredo Gamboa Jaramillo', s: 'SOL.BO', g: 'MASCULINO', c: '#feed00', p: '' },
      { n: 'Sucy Vicky Chura Quiuchaca', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Barbara Queso Laura', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Domingo Pinto Yale', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Juana Jenny Marza Laura', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'José Luis Juñes Santos', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Juan Luis Vargas Flores', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Martha Choque Tintaya', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Bernabe Heredia Colque', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Emilio Yanahuaya Carrión', s: 'SOL.BO', g: 'MASCULINO', c: '#feed00', p: '' },
      { n: 'Susana Cortez Mamani', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Edwin Zarate Mamani', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Elvia Arce Usnayo', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Marin Eugenio Sandoval Vega', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Ana Alicia Layme Cuno', s: 'ASP', g: 'FEMENINO', c: '#01a949', p: '' },
      { n: 'Daniel Kama', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Teodocia Vega', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Brigida Rosario Medina', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Luis Tinta Tinta', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' }
    ],
    poblacion15: [
      { n: 'Ema Wilma Magne de Mamani', s: 'SOL.BO', g: 'FEMENINO', c: '#feed00', p: '' },
      { n: 'Gustavo Torrico Landa', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Edgar Teodoro Cala Chambi', s: 'SOL.BO', g: 'MASCULINO', c: '#feed00', p: '' },
      { n: 'Elizabet Morales Gutierrez', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Alejandra Choque Acarapi', s: 'SOL.BO', g: 'FEMENINO', c: '#feed00', p: '' },
      { n: 'Edwin Hugo Herrera Salinas', s: 'SOL.BO', g: 'MASCULINO', c: '#feed00', p: '' },
      { n: 'Ismael Quispe Ticona', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Jimena Maglene Leonardo Choque', s: 'SOL.BO', g: 'FEMENINO', c: '#feed00', p: '' },
      { n: 'Marco Antonio fuentes Torrez', s: 'UN', g: 'MASCULINO', c: '#fbc501', p: '' },
      { n: 'Elsa Marino Marquez', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Idelfonzo Apaza Huanca', s: 'SOL.BO', g: 'MASCULINO', c: '#feed00', p: '' },
      { n: 'Luis Raúl Bautista Quispe', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Ines Lourdes Alcon Morales', s: 'SOL.BO', g: 'FEMENINO', c: '#feed00', p: '' },
      { n: 'Acefalo*', s: 'SOL.BO', g: '', c: '#feed00', p: '' },
      { n: 'Encarnación Salazar de Mamani', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Acefalo*', s: 'SOL.BO', g: '', c: '#feed00', p: '' },
      { n: 'Severino Estallani Bautista', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Acefalo*', s: 'SOL.BO', g: '', c: '#feed00', p: '' },
      { n: 'Claudia Gilda Bravo Terrazas', s: 'UN', g: 'FEMENINO', c: '#fbc501', p: '' },
      { n: 'Deysi Fabiola Almanza Ramirez', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' }
    ],
    indigena15: [
      { n: 'Damiana Coronel Landaveri', s: 'Afroboliviano', g: 'FEMENINO', c: '#888888', p: '' },
      { n: 'Tomas Mamani Vargas', s: 'Kallawaya', g: 'MASCULINO', c: '#888888', p: '' },
      { n: 'Jose Antolin Duran Laura', s: 'Leco', g: 'MASCULINO', c: '#888888', p: '' },
      { n: 'Lucrecia Josecito Suarez', s: 'Moseten', g: 'FEMENINO', c: '#888888', p: '' },
      { n: 'Celin Adalid Quenedo Cartagena', s: 'Tacana', g: 'MASCULINO', c: '#888888', p: '' }
    ],
  },
  '903': {
    nombre: 'Cochabamba',
    cands21: [{ sigla: 'MAS-IPSP', nombre: 'Humberto Sánchez Sánchez', color: '#0400ff' }, { sigla: 'SUMATE', nombre: 'Henry Antonio Paredes Polo', color: '#4d1b6e' }, { sigla: 'MTS', nombre: 'José Carlos Sánchez Verazaín', color: '#004026' }, { sigla: 'C-A', nombre: 'José Flores Burgos', color: '#eb6724' }, { sigla: 'PDC', nombre: 'Limber Ronal Morejón Antezana', color: '#777' }, { sigla: 'SOMOS', nombre: 'Faustino Challapa Flores', color: '#6f03be' }, { sigla: 'FPV', nombre: 'Reinaldo Becerra Butrón', color: '#165f4c' }, { sigla: 'PAN-BOL', nombre: 'William Zapata García', color: '#fb0303' }, { sigla: 'UNIDOS.CBBA', nombre: 'Juan Roberth Flores Encinas', color: '#ffe001' }],
    gan21: { nombre: 'Humberto Sánchez Sánchez', sigla: 'MAS-IPSP', pct: 57.44, color: '#0400ff' },
    gan15: { nombre: 'Iván Canelas Alurralde', sigla: 'MAS-IPSP', pct: 61.61, color: '#0400ff' },
    sv: null,
    territorio21: [
      { n: 'JESUS  QUISPE', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Arani' },
      { n: 'SANTUSA HUANCA MERCADO', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Arque' },
      { n: 'FRANCISCO OTALORA TICONA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Ayopaya' },
      { n: 'JESUS AGUAYO CONDORI', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Bolivar' },
      { n: 'ARIEL ANGEL HERBAS TASTACA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Capinota' },
      { n: 'VILMA MONTAÑO HIDALGO', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Carrasco' },
      { n: 'RODRIGO VALDIVIA GOMEZ', s: 'SUMATE', g: 'MASCULINO', c: '#4d1b6e', p: 'Cercado' },
      { n: 'MARIA LIZETH CASTRO SANDIVAR', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Chapare' },
      { n: 'JULIETA VEIZAGA GUEVARA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Esteban Arce' },
      { n: 'LILIANA MALDONADO AGUILAR', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Germán Jordán' },
      { n: 'MARIO WILDER ALVAREZ RODRIGUEZ', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Mizque' },
      { n: 'SALOME DIAS CRUZ', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Narciso Campero' },
      { n: 'MERCEDES TORRICO CLAROS', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Punata' },
      { n: 'FELIX SANDRO QUISPE ORELLANA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Quillacollo' },
      { n: 'RENATO ALANES BAZOALDO', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Tapacarí' },
      { n: 'ELENA AINE ESPINOZA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Tiraque' }
    ],
    poblacion21: [
      { n: 'SERGIO DE LA ZERDA VEIZAGA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'JUANITA ANCIETA ORELLANA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'JUAN CARLOS IRAHOLA PARICAGUA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'JANET CONDORI OLIVERA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'ORLANDO ZURITA ROJAS', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'VIRGINIA SILVESTRE ROSAS', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'ZACARIAS QUINTANA CHOQUEVILLCA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'NELY PINTO MELGAREJO', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'JESUS VALLEJOS MAMANI', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'ISABEL COLLARANA ZANGA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'ENRIQUE SILES MONTESINOS', s: 'SUMATE', g: 'MASCULINO', c: '#4d1b6e', p: '' },
      { n: 'ANNA PILAR LOZANO LAGUNA', s: 'SUMATE', g: 'FEMENINO', c: '#4d1b6e', p: '' },
      { n: 'PEDRO ANDRES BADRAN LEON', s: 'SUMATE', g: 'MASCULINO', c: '#4d1b6e', p: '' },
      { n: 'MAYA CASTRO ESCOBAR', s: 'SUMATE', g: 'FEMENINO', c: '#4d1b6e', p: '' },
      { n: 'DIEGO ANDRES BRAÑEZ LEAÑOS', s: 'SUMATE', g: 'MASCULINO', c: '#4d1b6e', p: '' },
      { n: 'FREDY ALIAGA BURGOA', s: 'MTS', g: 'MASCULINO', c: '#004026', p: '' }
    ],
    indigena21: [
      { n: 'RUTH ISATEGUA GUAGUASU', s: 'Yuqui', g: 'FEMENINO', c: '#8B5E3C', p: '' },
      { n: 'DIEGO ELADIO ROCA NUNEZ', s: 'Yuracaré', g: 'MASCULINO', c: '#8B5E3C', p: '' }
    ],
    secretarios21: [
      { n: 'JOSÉ GUILLERMO BAZOBERRY CHALI', cargo: 'Planificación' },
      { n: 'MARIA ANGÉLICA GALINDO MEDRANO', cargo: 'Finanzas Y Administración' },
      { n: 'JUAN CARLOS SALAS SONAGUA', cargo: 'Desarrollo Humano' },
      { n: 'DAYSI MARLEN ROCABADO ESPINOZA', cargo: 'Salud' },
      { n: 'PEDRO JUAN CARVAJAL SARMIENTO', cargo: 'Coordinación General' },
      { n: 'OMAR CLAROS PANOZO', cargo: 'Desarrollo Productivo Y Economía Plural' },
      { n: 'ELEUTERIO GALINDO MUÑOZ', cargo: 'Minería' },
      { n: 'MARCELA CIOMAR RODRIGUEZ YRAISOS', cargo: 'De La Madre Tierra' },
      { n: 'VILMA JANETH NOGALES PEÑA', cargo: 'Obras Y Servicios' },
      { n: 'IRVICK JOSÉ DE LA FUERTE JERIA', cargo: 'Asesor General Del Órgano Ejecutivo' },
      { n: 'PATRICIA DOLORES SANCHEZ TROCHE', cargo: 'Directora De Asuntos Jurídicos Y Normativos' }
    ],
    territorio15: [
      { n: 'ESTHER SORIA GONZALES', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'EDIBERTO SOTO QUISPE', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'TEODOCIO QUISPE ESCALERA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'MARTIN SILES IRIARTE', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'ANGEL MARIN GUAMAN', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'MARINA FLORES TOLA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'FLORA ORELLANA SANCA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'ZULEMA VILLARROEL ESCOBAR', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'MARIA PATZI FERNANDEZ', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'MARTHA ARRATIA CHOQUE', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'MARIA FRANCISCO COLQUE', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'FIDEL ROJAS CATORCENO', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'JUAN SILES POZO', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'JENNRRY VASQUEZ QUINTEROS', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'BARBARA ALAVE ARIAS', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'LUIS VARGAS GUAMAN', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' }
    ],
    poblacion15: [
      { n: 'LEONIDA ZURITA VARGAS', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'JOSE JAVIER CASTELLON TORRICO', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'MARIO ORELLANA MAMANI', s: 'DEMOCRATAS', g: 'MASCULINO', c: '#43b43d', p: '' },
      { n: 'LUISA ARROSTE QUISPE', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'LUIS VILLARROEL CENTELLAS', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'CINTHYA MENDOZA VARGAS', s: 'DEMOCRATAS', g: 'FEMENINO', c: '#43b43d', p: '' },
      { n: 'MARIA OLIVIA NAVARRO BARRIGA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'RENE ROCABADO ALEGRE', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'VICTORIA LIZETH BERAMENDI ORELLANA', s: 'UNICO', g: 'FEMENINO', c: '#bd1e1a', p: '' },
      { n: 'EDUARDO SARMIENTO ROJAS', s: 'DEMOCRATAS', g: 'MASCULINO', c: '#43b43d', p: '' },
      { n: 'JACQUELINE LYNETH POZO ROCHA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'OMAR DELGADILLO CANELAS', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'LINETH VILLARROEL PANOZO', s: 'DEMOCRATAS', g: 'FEMENINO', c: '#43b43d', p: '' },
      { n: 'ESTELA MIRIAN RIVERA EID', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'DANIEL TORRES ROJAS', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'FREDDY GONZALES RODRIGUEZ', s: 'DEMOCRATAS', g: 'MASCULINO', c: '#43b43d', p: '' }
    ],
    indigena15: [
      { n: 'Abel Laiara', s: 'Yuqui', g: 'MASCULINO', c: '#888888', p: '' },
      { n: 'Gabriela Morales Pradel', s: 'Yuracare', g: 'FEMENINO', c: '#888888', p: '' }
    ],
  },
  '904': {
    nombre: 'Oruro',
    cands21: [{ sigla: 'MAS-IPSP', nombre: 'Johnny Franklin Vedia Rodríguez', color: '#0400ff' }, { sigla: 'BST', nombre: 'Eddgar Sánchez Aguirre', color: '#ff6501' }, { sigla: 'C-A', nombre: 'Jhonny Rocha Ayala', color: '#eb6724' }, { sigla: 'UNICO', nombre: 'Zenobio Calizaya Velásquez', color: '#bd1e1a' }, { sigla: 'PDC', nombre: 'Wilfredo Fernando Montaño Miranda', color: '#777' }, { sigla: 'FPV', nombre: 'Marcelo Fidel Pérez Soliz', color: '#165f4c' }],
    gan21: { nombre: 'Johnny Franklin Vedia Rodríguez', sigla: 'MAS-IPSP', pct: 46.31, color: '#0400ff' },
    gan15: { nombre: 'Victor Hugo Vásquez Mamani', sigla: 'MAS-IPSP', pct: 57.65, color: '#0400ff' },
    sv: null,
    territorio21: [
      { n: 'MARTINA ARAVIRI CHOQUE', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Atahuallpa' },
      { n: 'DELIA GONGORA VELIZ', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Carangas' },
      { n: 'ESPERANZA MAMANI AJHUACHO', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Cercado' },
      { n: 'TEODORO CALIZAYA CHOQUERIVE', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Eduardo Avaroa' },
      { n: 'MARIA MAMANI MOLINA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Ladislao Cabrera' },
      { n: 'NATIVIDAD CRUZ ACURANA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Litoral' },
      { n: 'FREDDY RAUL RAMOS QUISPE', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Nor Carangas' },
      { n: 'NICOLAS CHOQUE COLQUE', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Pantaleon Dalence' },
      { n: 'FRANCISCA LUISA RUFINO CALIZAYA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Poopo' },
      { n: 'DAVID DANTE CHOQUE ZEGARRA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Puerto de Mejillones' },
      { n: 'MAXIMA APAZA LUNA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Sajama' },
      { n: 'JHOSELIN ANCONI CHAMBI', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'San Pedro de Totora' },
      { n: 'ALFREDO ACAPA COLQUE', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Saucarí' },
      { n: 'ZULMA ARELLANO CHOQUETOPA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Sebastian Pagador' },
      { n: 'HUGO HUANCA CHOQUE', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Sud Carangas' },
      { n: 'ERWIN VARGAS CHACON', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Tomas Barrón' }
    ],
    poblacion21: [
      { n: 'EDGAR ALEX HUANCA GUANAY', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'MARINA QUISPE CHOQUE', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'EDWIN FUENTES CAMACHO', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'MARIA CAROLINA LINO CONDORI', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'RAMON RAUL CARO SANTOS', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'ANABEL BERNARDA CHAMBI LAURA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'ARMANDO BARRERA CHOQUETICLLA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'JUANA GABRIELA ESCARZO MAMANI', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'RONMIE VILLCA ALTAMIRANO', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'ROMAN BRITO', s: 'UN SOL PARA ORURO', g: 'MASCULINO', c: '#d90708', p: '' },
      { n: 'MIRIAM LUCIA ROCHA CANAVIRI', s: 'UN SOL PARA ORURO', g: 'FEMENINO', c: '#d90708', p: '' },
      { n: 'FRANZ JHONNY OCHOA YUCRA', s: 'UN SOL PARA ORURO', g: 'MASCULINO', c: '#d90708', p: '' },
      { n: 'AUSBERTO CONDORI CHOQUE', s: 'BST', g: 'MASCULINO', c: '#ff6501', p: '' },
      { n: 'ANA TARQUI ADRIAN', s: 'BST', g: 'FEMENINO', c: '#ff6501', p: '' },
      { n: 'FREDDY CASTILLO CHAVEZ', s: 'PP', g: 'MASCULINO', c: '#f39e37', p: '' },
      { n: 'JHONY FERNANDEZ CALANI', s: 'MTS', g: 'MASCULINO', c: '#004026', p: '' }
    ],
    indigena21: [
      { n: '* NO HAY UN ACUERDO INTERNO SOBRE LA ELECCIÓN DE SU REPRESENTANTE. POR TANTO, EN EL MARCO DE LA AUTODETERMINACIÓN Y EL AUTOGOBIERNO, SE AGUARDA UN CONSENSO PARA TENER ESTE DATO.', s: 'Chipaya', g: 'MASCULINO', c: '#8B5E3C', p: '' },
      { n: '* NO HAY UN ACUERDO INTERNO SOBRE LA ELECCIÓN DE SU REPRESENTANTE. POR TANTO, EN EL MARCO DE LA AUTODETERMINACIÓN Y EL AUTOGOBIERNO, SE AGUARDA UN CONSENSO PARA TENER ESTE DATO.', s: 'Murato', g: 'MASCULINO', c: '#8B5E3C', p: '' }
    ],
    secretarios21: [
      { n: 'FELIPE CHOQUE TARQUI', cargo: 'Secretario General' },
      { n: 'HENRY RONALD HEREDIA MONTERO', cargo: 'Administrativo Y Finanzas Públicas' },
      { n: 'ABDÓN HERNÁN FLORES QUISBERT', cargo: 'Planificación Y Desarrollo' },
      { n: 'VLADIMIR WALTER OQUENDO GARCÍA', cargo: 'Asuntos Jurídicos' },
      { n: 'ERNESTO CALLAPA RODRÍGUEZ', cargo: 'Desarrollo Productivo E Industrias' },
      { n: 'CARLA GIOVANNA ÁLVAREZ FLORES', cargo: 'Desarrollo Social Y Seguridad Alimentaria' },
      { n: 'ÁNGEL GUTIÉRREZ BERRIOS', cargo: 'Medio Ambiente Y Madre Tierra' },
      { n: 'MIGUEL FERNANDO LUPA PÉREZ.', cargo: 'Cultura Y Turismo' }
    ],
    territorio15: [
      { n: 'Simon Vallejos Katari', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Cristina Crescencia Arroyo Apaza', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Judith Nancy Morales Tapia', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Carlos Espiritu Quenaya Moller', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Verónica Mabel Caceres Kussy', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Eliezer Nina Escobar', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Enriqueta Rosario Perez Villca', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Zenon Pizarro Garisto', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Luis Fernandez Ayma', s: 'PP', g: 'MASCULINO', c: '#f39e37', p: '' },
      { n: 'Felix Condori Choque', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Roberto Cabezas Pacheco', s: 'PP', g: 'MASCULINO', c: '#f39e37', p: '' },
      { n: 'Moises Ticlla Zenteno', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Dario Gerardo Ala Monroy', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Edson Milton Ocsachoque Geronimo', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Getulio Gonzales Colque', s: 'DemÃ³cratas', g: 'MASCULINO', c: '#888888', p: '' },
      { n: 'Modesta Mariam Magne Molina', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' }
    ],
    poblacion15: [
      { n: 'Sabino Fabrica Caricari', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Reveca Ocaña Apaza', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Vladimir Franklin Rodriguez Hurtado', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Danitza Sandra Villarroel Gonzales', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Felix Tapia Ajhuacho', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Rosario Soliz Flores', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Severo Cucho Perez', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Eliana Salazar Quispe', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Ruben Jemuel Mamani Ramírez', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Lizandro García Arce', s: 'PP', g: 'MASCULINO', c: '#f39e37', p: '' },
      { n: 'Maria Luz Veliz Gonzales', s: 'PP', g: 'FEMENINO', c: '#f39e37', p: '' },
      { n: 'Juan Aguilar Teran', s: 'PP', g: 'MASCULINO', c: '#f39e37', p: '' },
      { n: 'Saul Wildy Sanchez Mollo', s: 'DemÃ³cratas', g: 'MASCULINO', c: '#888888', p: '' },
      { n: 'Valerio Rioja Suntura', s: 'UN', g: 'MASCULINO', c: '#fbc501', p: '' },
      { n: 'Amadeo Tapia Ramos', s: 'UCS', g: 'MASCULINO', c: '#00a9ec', p: '' },
      { n: '', s: 'DemÃ³cratas', g: '', c: '#888888', p: '' }
    ],
    indigena15: [
      { n: 'Andres Choque Huanaco', s: 'Uru Chipaya', g: 'MASCULINO', c: '#888888', p: '' }
    ],
  },
  '905': {
    nombre: 'Potosí',
    cands21: [{ sigla: 'MAS-IPSP', nombre: 'Jhonny Oscar Mamani Gutiérrez', color: '#0400ff' }, { sigla: 'PAN-BOL', nombre: 'William Zapata García', color: '#fb0303' }, { sigla: 'C-A', nombre: 'Mirtha Quevedo Aranibar', color: '#eb6724' }, { sigla: 'FPV', nombre: 'Freddy Rioja Melgar', color: '#165f4c' }],
    gan21: { nombre: 'Jhonny Oscar Mamani Gutiérrez', sigla: 'MAS-IPSP', pct: 44.05, color: '#0400ff' },
    gan15: { nombre: 'Juan Carlos Cejas Ugarte', sigla: 'MAS-IPSP', pct: 62.21, color: '#0400ff' },
    sv: null,
    territorio21: [
      { n: 'JACINTO SUNAGUA DORADO', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Alonzo de Ibáñez' },
      { n: 'FATIMA MARIA ALBINO ESQUIVEL', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Antonio Quijarro' },
      { n: 'GUALBERTO GARCIA CHAMBI', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Bernardino Bilbao' },
      { n: 'AMALIA CAPUSIRI CASANA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Charcas' },
      { n: 'MARIA GUARAYO MARCANI', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Chayanta' },
      { n: 'RAIMUNDA CORDERO CABA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Cornelio Saavedra' },
      { n: 'EDGAR APALA VIDAURRE', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Daniel Campos' },
      { n: 'EMILIO MURAÑA HUANCA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Enrique Baldivieso' },
      { n: 'MARCIAL AYALI VILLCA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'José Maria Linares' },
      { n: 'SILVANA VANESA BAÑOS CABEZAS', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Modesto Omiste' },
      { n: 'GROVER ARMIN YELMA CHAIRA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Nor Chichas' },
      { n: 'JHENNY MARIA QUISBERT SALVATIERRA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Nor Lipez' },
      { n: 'FLORIANO ACERO CONDORI', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Rafael Bustillo' },
      { n: 'BLANCA CELIA BURGOS QUISPE', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Sud Chichas' },
      { n: 'ALBERTO QUISPE MAMANI', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Sud Lipez' },
      { n: 'MARIA LORENZA QUISPE RODRIGUEZ', s: 'PAN-BOL', g: 'FEMENINO', c: '#fb0303', p: 'Tomas Frias' }
    ],
    poblacion21: [
      { n: 'DORA FLORES MENDEZ', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'MARCO ANTONIO COPA GUTIERREZ', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'KARRIE ANGELINE PUMA MIRANDA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'JAIME FERNANDEZ LLAVE', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'ANA MARIA COLQUE MAMANI', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'WILBER JANCKO MAMANI', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'XIMENA PAILLO AGUILAR', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'PEDRO CONDORI MAMANI', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'HIPOLITA PORCO CUIZA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'LEON JANCKO CONDORI', s: 'AS', g: 'MASCULINO', c: '#104b29', p: '' },
      { n: 'BERTA AGUILAR FLORES', s: 'AS', g: 'FEMENINO', c: '#104b29', p: '' },
      { n: 'ERNESTO LOZA ARIAS', s: 'AS', g: 'MASCULINO', c: '#104b29', p: '' },
      { n: 'REINALDO JHASMANNY ROMANA MONZON', s: 'PAN-BOL', g: 'MASCULINO', c: '#fb0303', p: '' },
      { n: 'ROGELIA XIMENA TARQUI GOMEZ', s: 'PAN-BOL', g: 'FEMENINO', c: '#fb0303', p: '' },
      { n: 'OSVALDO JAIME FLORES', s: 'MOP', g: 'MASCULINO', c: '#f28a24', p: '' },
      { n: 'AZUCENA ALEJANDRA FUERTES MAMANI', s: 'PUKA SUNQU', g: 'FEMENINO', c: '#d22d27', p: '' }
    ],
    indigena21: [

    ],
    secretarios21: [
      { n: 'RUBÉN MIRANDA CASTRO', cargo: 'Asuntos Jurídicos' },
      { n: 'MARCELINO MAMANI MAMANI', cargo: 'Turismo' },
      { n: 'LISVANIA TEJERINA CÓRDOVA', cargo: 'Administrativa Financiera' },
      { n: 'EFRAÍN BARJA REINAGA', cargo: 'Obras Públicas' },
      { n: 'ÁLVARO PERALTA JUANES', cargo: 'Desarrollo Productivo Y Seguridad Alimentaria' },
      { n: 'JOSÉ LUIS MIRANDA QUILO', cargo: 'Secretario General' },
      { n: 'NELSON GABRIEL CHAMBI', cargo: 'Madre Tierra' },
      { n: 'EDWIN MENACHO MARCANI', cargo: 'Desarrollo Humano' },
      { n: 'ALDO TEJERINA FLORES', cargo: 'Industrialización' },
      { n: 'ELOY EDWIN CAPACIRI GUEVARA', cargo: 'Planificación' },
      { n: 'ELÍAS CHOQUE', cargo: 'Minería Y Metalurgia' }
    ],
    territorio15: [
      { n: 'Leon Quentasi Canaza', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Segundina Guzman  Aguilar', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Felipe Sanitllan Calvimonte', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'María Eugenia  Vasagoitia', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Raúl Terceros Coyo', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Eva Navarro Mamani', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Rufina Coca Soliz', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Richard Henry Ramirez Aramayo', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Omar Veliz Ramos', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Adela Farfan Leime', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Teresa Flores Díaz', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Eloy Calisaya Mamani', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Rogelio Mamani Almendra', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Nilda Flores Ticona', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Oracio Aramayo Toloba', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Rita Salvatierra Bautista', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' }
    ],
    poblacion15: [
      { n: 'Teodroa Consuelo  Maizares', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Jose Flores Nicolas', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Valeriano Gabriel Vargas', s: 'MOP', g: 'MASCULINO', c: '#f28a24', p: '' },
      { n: 'Mirian Vargas Pelaez', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Policarpio Acarapi Copa', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Henry Prospero Lopez Alvarez', s: 'UN', g: 'MASCULINO', c: '#fbc501', p: '' },
      { n: 'Nancy Torrez Villapuma', s: 'MOP', g: 'FEMENINO', c: '#f28a24', p: '' },
      { n: 'Valieria Marcia Flores Choque', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Antonio Flores Oña', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Lidia Colque Laura', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Jose Luis Gamarra Quintana', s: 'MOP', g: 'MASCULINO', c: '#f28a24', p: '' },
      { n: 'Ronald Amilcar Garabito Condori', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Julieta Tola Paqui', s: 'UN', g: 'FEMENINO', c: '#fbc501', p: '' },
      { n: 'Martina Gerónimo Colque', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Rosemary Fernandez Rodriguez', s: 'MOP', g: 'FEMENINO', c: '#f28a24', p: '' },
      { n: 'Justo Guiterrez Acchura', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' }
    ],
    indigena15: [],
  },
  '906': {
    nombre: 'Tarija',
    cands21: [{ sigla: 'UNIDOS POR TARIJA', nombre: 'Oscar Gerardo Montes Barzón', color: '#6f03be' }, { sigla: 'MAS-IPSP', nombre: 'Álvaro Horacio Ruiz García', color: '#0400ff' }, { sigla: 'MTS', nombre: 'Luis Bertín Alfaro Arias', color: '#004026' }, { sigla: 'FPV', nombre: 'Wilfredo Barrios Arancibia', color: '#165f4c' }, { sigla: 'ISA', nombre: 'Cand. ISA', color: '#125809' }, { sigla: 'TPT', nombre: 'Cand. TPT', color: '#f96a02' }, { sigla: 'COMUNIDAD DE TODOS', nombre: 'Cand. Com. de Todos', color: '#f67f09' }],
    gan21: { nombre: 'Oscar Gerardo Montes Barzón', sigla: 'UNIDOS POR TARIJA', pct: 54.44, color: '#6f03be' },
    gan15: { nombre: 'Adrián Esteban Oliva Alcázar', sigla: 'UD-A', pct: 60.69, color: '#aba117' },
    sv: { diferencia: 358, ganador2vPct: 54.44, candidatos1v: [{ sigla: 'MAS-IPSP', nombre: 'Álvaro Horacio Ruiz García', pct1v: 38.17, color: '#0400ff' }, { sigla: 'UNIDOS POR TARIJA', nombre: 'Oscar Gerardo Montes Barzón', pct1v: 38.05, color: '#6f03be' }] },
    territorio21: [
      { n: 'FLAVIA APARICIO QUIROGA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Aniceto Arce' },
      { n: 'RUBEN REYES VEGA', s: 'UNIDOS POR TARIJA', g: 'MASCULINO', c: '#6f03be', p: 'Aniceto Arce' },
      { n: 'DAMIAN CASTILLO VILLARRUVIA', s: 'UNIDOS POR TARIJA', g: 'MASCULINO', c: '#6f03be', p: 'Cercado' },
      { n: 'OSVALDO YUCRA QUISPE', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Cercado' },
      { n: 'ILSEN MARIA LUZ CAMACHO PONCE', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Eustaquio Méndez' },
      { n: 'DIEGO FABIO GUTIERREZ AGUILERA', s: 'UNIDOS POR TARIJA', g: 'MASCULINO', c: '#6f03be', p: 'Eustaquio Méndez' },
      { n: 'ZAIDA CASILDA LAURA CHARCA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Gran Chaco' },
      { n: 'LIMBERT ALBARO OJEDA ROCHA', s: 'UNIDOS POR TARIJA', g: 'MASCULINO', c: '#6f03be', p: 'Gran Chaco' },
      { n: 'CATALINA GARECA MAMANI', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'José María Avilés' },
      { n: 'JUAN  CONDORI', s: 'UNIDOS POR TARIJA', g: 'MASCULINO', c: '#6f03be', p: 'José María Avilés' }
    ],
    poblacion21: [
      { n: 'JOSÉ ANTONIO YUCRA PAREDES', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Aniceto Arce' },
      { n: 'JULIO ANDRÉS TORRES AUZA', s: 'UNIDOS POR TARIJA', g: 'MASCULINO', c: '#6f03be', p: 'Aniceto Arce' },
      { n: 'MAURICIO ADOLFO LEA PLAZA PELAEZ', s: 'UNIDOS POR TARIJA', g: 'MASCULINO', c: '#6f03be', p: 'Cercado' },
      { n: 'DELIA GARCIA OBLITAS', s: 'UNIDOS POR TARIJA', g: 'FEMENINO', c: '#6f03be', p: 'Cercado' },
      { n: 'LUIS FERNANDO LEMA MOLINA', s: 'UNIDOS POR TARIJA', g: 'FEMENINO', c: '#6f03be', p: 'Cercado' },
      { n: 'WALTER AGUILERA VALDEZ', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Cercado' },
      { n: 'MARINA SEBASTIANA HOYOS RAMOS', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Cercado' },
      { n: 'FRANCISCO ROSAS URZAGASTE', s: 'COMUNIDAD DE TODOS', g: 'MASCULINO', c: '#f67f09', p: 'Cercado' },
      { n: 'JUANITA MAGALI MIRANDA RAMIREZ', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Eustaquio Méndez' },
      { n: 'KARINA ROXANA BARRIOS VALENCIA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Gran Chaco' },
      { n: 'ERICK SAÚL BEJARANO RUIZ', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Gran Chaco' },
      { n: 'ALAN BARCA HERRERA', s: 'UNIDOS POR TARIJA', g: 'MASCULINO', c: '#6f03be', p: 'Gran Chaco' },
      { n: 'JORGE LUIS SANGUINO MOLINA', s: 'COMUNIDAD DE TODOS', g: 'MASCULINO', c: '#f67f09', p: 'Gran Chaco' },
      { n: 'EIDER QUIROGA MARAZ', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'José María Avilés' }
    ],
    indigena21: [
      { n: 'NICOLÁS MONTERO ANDRECHI', s: 'Guarani', g: 'MASCULINO', c: '#8B5E3C', p: '' },
      { n: 'JOSÉ LUIS FERREIRA COREMA', s: 'Tapiete', g: 'MASCULINO', c: '#8B5E3C', p: '' },
      { n: '(POR DEFINIR)', s: 'Weenhayek', g: 'MASCULINO', c: '#8B5E3C', p: '' }
    ],
    secretarios21: [
      { n: 'ERICH MONTAÑO', cargo: 'Economía Finanzas' },
      { n: 'KARINA LIEBERS', cargo: 'Planificación E Inversión' },
      { n: 'HUGO EFRAÍN RIVERA', cargo: 'Desarrollo Productivo' },
      { n: 'MARÍA LOURDES VACA', cargo: 'Desarrollo Humano' },
      { n: 'JORGE MARIANO BACOTICH', cargo: 'Gestión Institucional' },
      { n: 'DORIZ SUBIETA', cargo: 'Obras Públicas' }
    ],
    territorio15: [
      { n: 'MAURICIO ADOLFO LEA PLAZA PELAEZ', s: 'UD-A', g: 'MASCULINO', c: '#aba117', p: '' },
      { n: 'GUADALUPE DAMIANA JURADO RUIZ', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'DINA EMERITA APARICIO MARTINEZ', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'ROBERTO CARLOS CARDOZO REYES', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'WILFREDO ZURCA SANCHEZ', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'MARTHA GALLARDO ORDOÑEZ', s: 'ISA', g: 'FEMENINO', c: '#125809', p: '' },
      { n: 'GUILLERMO VEGA FLORES', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'BASILIO RAMOS MAMANI', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'SANDRA JEREZ SOLIZ', s: 'UD-A', g: 'FEMENINO', c: '#aba117', p: '' },
      { n: 'SARA ARMELLA RUEDA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'CECILIA GALLARDO SURUGUAY', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'MARIYETT PAULINA JARAMILLO TAPIA', s: 'UD-A', g: 'FEMENINO', c: '#aba117', p: '' }
    ],
    poblacion15: [
      { n: 'MARIA LOURDES VACA VIDAURRE', s: 'UD-A', g: 'FEMENINO', c: '#aba117', p: '' },
      { n: 'ROSA AMANDA CALISAYA FLORES', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'CESAR MENTASTI PADILLA', s: 'UD-A', g: 'MASCULINO', c: '#aba117', p: '' },
      { n: 'MARIA ELENA MENDEZ LEON', s: 'UD-A', g: 'FEMENINO', c: '#aba117', p: '' },
      { n: 'ERVIN SANDRO MANSILLA OLARTE', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'WILLAMS JOEL GUERRERO QUIROGA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'PABLO COLQUE BAUTISTA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'DANIEL ANDRES CARVAJAL SOLANO', s: 'UD-A', g: 'MASCULINO', c: '#aba117', p: '' },
      { n: 'WILMAN RAMON CARDOZO SURRIABRE', s: 'UD-A', g: 'MASCULINO', c: '#aba117', p: '' },
      { n: 'JORGE ARIAS SOTO', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'NORAH ELVIA TERAN ORTIZ', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'NORMA FLORES GUTIERREZ', s: 'ISA', g: 'FEMENINO', c: '#125809', p: '' },
      { n: 'CARLA LORENA PERALTA BURGOS', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'BICHER RAFAEL ORDOÑEZ CORTEZ', s: 'UD-A', g: 'MASCULINO', c: '#aba117', p: '' },
      { n: 'ABEL GUZMAN MURGIA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' }
    ],
    indigena15: [
      { n: 'GILBERTO MÁRQUEZ SÁNCHEZ', s: 'WEENHAYEK', g: 'MASCULINO', c: '#888888', p: '' },
      { n: 'JOSÉ GUERRERO TORIBIO', s: 'WEENHAYEK', g: 'MASCULINO', c: '#888888', p: '' },
      { n: 'VICENTE FERREIRA CAREMA', s: 'TAPIETE', g: 'MASCULINO', c: '#888888', p: '' },
      { n: 'ALBERTO VIOREL CALVIMONTES', s: 'GUARANI', g: 'MASCULINO', c: '#888888', p: '' },
      { n: 'ROMAN GOMEZ LOPEZ', s: 'GUARANI', g: 'MASCULINO', c: '#888888', p: '' },
      { n: 'Jose Luis Ferreira Carema', s: 'TAPIETE', g: 'MASCULINO', c: '#888888', p: '' }
    ],
  },
  '907': {
    nombre: 'Santa Cruz',
    cands21: [{ sigla: 'CREEMOS', nombre: 'Luis Fernando Camacho Vaca', color: '#781e40' }, { sigla: 'MAS-IPSP', nombre: 'Pamela Añez', color: '#0400ff' }, { sigla: 'MNR', nombre: 'Braulio Espinoza Cordes', color: '#ed83ab' }, { sigla: 'FPV', nombre: 'Roger Martínez Becerra', color: '#165f4c' }, { sigla: 'ASIP', nombre: 'Cand. ASIP', color: '#900C3F' }, { sigla: 'FE', nombre: 'Cand. FE', color: '#06773d' }, { sigla: 'SOL', nombre: 'Cand. SOL', color: '#d9612f' }, { sigla: 'UNIDOS', nombre: 'Cand. UNIDOS', color: '#6f03be' }],
    gan21: { nombre: 'Luis Fernando Camacho Vaca', sigla: 'CREEMOS', pct: 55.64, color: '#781e40' },
    gan15: { nombre: 'Rubén Armando Costas Aguilera', sigla: 'DEMOCRATAS', pct: 59.44, color: '#43b43d' },
    sv: null,
    territorio21: [
      { n: 'KEILA FERNANDA GARCIA MILHOMEN', s: 'CREEMOS', g: 'FEMENINO', c: '#781e40', p: 'Andrés Ibáñez' },
      { n: 'HUGO VALVERDE VEIZAGA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Caballero' },
      { n: 'KARIM IVAN QUEZADA DORADO', s: 'CREEMOS', g: 'MASCULINO', c: '#781e40', p: 'Chiquitos' },
      { n: 'MARIANELA BALDELOMAR DAVALOS', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Cordillera' },
      { n: 'ANTONIO PACO BARRAL', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Florida' },
      { n: 'YBAR ANTELO DORADO', s: 'ASIP', g: 'MASCULINO', c: '#900C3F', p: 'German Busch' },
      { n: 'PAMELA HILARION TRUJILLO', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Guarayos' },
      { n: 'CLEMENTE RAMOS CONDORI', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Ichilo' },
      { n: 'GABRIELA JUSTINIANO ZABALA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Ignacio Warnes' },
      { n: 'YELLY BALDIVIESO MAYSER', s: 'CREEMOS', g: 'FEMENINO', c: '#781e40', p: 'José Miguel de Velasco' },
      { n: 'RAQUEL VALENCIA ASPETTY', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Obispo Santistevan' },
      { n: 'CARLOS MARCELO AROSTEGUI RIBERA', s: 'CREEMOS', g: 'MASCULINO', c: '#781e40', p: 'Sara' },
      { n: 'MAVY DARINKA  PEDRAZA', s: 'CREEMOS', g: 'FEMENINO', c: '#781e40', p: 'Vallegrande' },
      { n: 'WILFREDO PEINADO CUELLAR', s: 'CREEMOS', g: 'MASCULINO', c: '#781e40', p: 'Ángel Sandóval' },
      { n: 'DILFE RENTERIA ARATEA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Ñuflo de Chávez' }
    ],
    poblacion21: [
      { n: 'ZVONKO MATKOVIC RIBERA', s: 'CREEMOS', g: 'MASCULINO', c: '#781e40', p: '' },
      { n: 'JESSICA PAOLA AGUIRRE MELGAR', s: 'CREEMOS', g: 'FEMENINO', c: '#781e40', p: '' },
      { n: 'ANTONIO SALVADOR TALAMAS PANIAGUA', s: 'CREEMOS', g: 'MASCULINO', c: '#781e40', p: '' },
      { n: 'KATHIA LISBETH QUIROGA FERNANDEZ', s: 'CREEMOS', g: 'FEMENINO', c: '#781e40', p: '' },
      { n: 'OSCAR NELSON FEENEY KRAUSE', s: 'CREEMOS', g: 'MASCULINO', c: '#781e40', p: '' },
      { n: 'CARMEN MURIEL CRUZ CLAROS', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'SILVESTRE JHONNY ZEBALLOS FERREL', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'SUSANA VACA PEÑA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' }
    ],
    indigena21: [
      { n: '*AIDA GIL MELGAR (SIN RESOLUCIÓN)', s: 'Chiquitano', g: 'FEMENINO', c: '#8B5E3C', p: '' },
      { n: '*MANUEL CHIQUENO (SIN RESOLUCIÓN)', s: 'Ayoreo', g: 'MASCULINO', c: '#8B5E3C', p: '' },
      { n: 'WILSON CORTEZ', s: 'Yuracare Mojeño', g: 'MASCULINO', c: '#8B5E3C', p: '' },
      { n: 'ROBERTO URAÑAVI', s: 'Guarayo', g: 'MASCULINO', c: '#8B5E3C', p: '' },
      { n: 'RAMIRO VALLE MANDEPORA', s: 'Guarani', g: 'MASCULINO', c: '#8B5E3C', p: '' }
    ],
    secretarios21: [
      { n: 'MIGUEL NAVARRO', cargo: 'Gestión Institucional' },
      { n: 'EFRAÍN SUÁREZ', cargo: 'Justicia Y Defensa Ciudadana' },
      { n: 'ALEJANDRA SANDOVAL', cargo: 'Medio Ambiente' },
      { n: 'FERNANDO PACHECO', cargo: 'Salud Y Desarrollo Humano' },
      { n: 'ORLANDO SAUCEDO VACA', cargo: 'Economía Y Hacienda' },
      { n: 'RUBÉN SUÁREZ', cargo: 'Seguridad Ciudadana' },
      { n: 'LUIS FERNANDO MENACHO', cargo: 'Desarrollo Económico' },
      { n: 'JOSÉ LUIS BLANCO HERBAS', cargo: 'Pueblos Indígenas' }
    ],
    territorio15: [
      { n: 'Kathia Lisbeth Quiroga Fernandez', s: 'DEMOCRATAS', g: 'FEMENINO', c: '#43b43d', p: '' },
      { n: 'Mariela  Paniagua Vaca Diez', s: 'DEMOCRATAS', g: 'FEMENINO', c: '#43b43d', p: '' },
      { n: 'Carlos Ruddy Dorado Flores', s: 'DEMOCRATAS', g: 'MASCULINO', c: '#43b43d', p: '' },
      { n: 'Edwin Muñoz Vedia', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Hugo Antonio Salmon Rivero', s: 'DEMOCRATAS', g: 'MASCULINO', c: '#43b43d', p: '' },
      { n: 'Maria Arias', s: 'DEMOCRATAS', g: 'FEMENINO', c: '#43b43d', p: '' },
      { n: 'Margoth Miriam Segovia', s: 'DEMOCRATAS', g: 'FEMENINO', c: '#43b43d', p: '' },
      { n: 'Alcides Vargas Vega', s: 'DEMOCRATAS', g: 'MASCULINO', c: '#43b43d', p: '' },
      { n: 'Reinaldo Seas Pimentel', s: 'DEMOCRATAS', g: 'MASCULINO', c: '#43b43d', p: '' },
      { n: 'Bertha Limpias Herrera', s: 'DEMOCRATAS', g: 'FEMENINO', c: '#43b43d', p: '' },
      { n: 'Maria Gabriela Rivero Serrate', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Alcides  Villagomez Ibañez', s: 'DEMOCRATAS', g: 'MASCULINO', c: '#43b43d', p: '' },
      { n: 'Froilan Becerra Serrano', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Jose Luis Martinez Colombo', s: 'DEMOCRATAS', g: 'MASCULINO', c: '#43b43d', p: '' },
      { n: 'Wilson Añez Yamba', s: 'DEMOCRATAS', g: 'MASCULINO', c: '#43b43d', p: '' }
    ],
    poblacion15: [
      { n: 'Lily Luisa Ramos Rojas', s: 'DEMOCRATAS', g: 'FEMENINO', c: '#43b43d', p: '' },
      { n: 'Roger Gonzales Valverde', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Juan Marco Mejia Mendez', s: 'DEMOCRATAS', g: 'MASCULINO', c: '#43b43d', p: '' },
      { n: 'Ronay Teresita Mendez Chavarria', s: 'DEMOCRATAS', g: 'MASCULINO', c: '#43b43d', p: '' },
      { n: 'Lidia Maribel Castillo Nogales', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Ronald Floriberto Moreno Garcia', s: 'DEMOCRATAS', g: 'MASCULINO', c: '#43b43d', p: '' },
      { n: 'Isaac Avalos Cuchallo', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Katia Marilyn Romero Fernandez', s: 'DEMOCRATAS', g: 'FEMENINO', c: '#43b43d', p: '' }
    ],
    indigena15: [
      { n: 'Suby Picanerai Chiquejñoi', s: 'AYOREO', g: 'MASCULINO', c: '#888888', p: '' },
      { n: 'Rosmery Orosco Angel', s: 'YURACARE-MOJEÃO', g: 'FEMENINO', c: '#888888', p: '' },
      { n: 'Ruth Yarigua Coronillo', s: 'GUARANI', g: 'FEMENINO', c: '#888888', p: '' },
      { n: 'Ruben Memacho Zare', s: 'GUARAYO', g: 'MASCULINO', c: '#888888', p: '' },
      { n: 'Emigio Poiche Rivero', s: 'CHIQUITANO', g: 'MASCULINO', c: '#888888', p: '' }
    ],
  },
  '908': {
    nombre: 'Beni',
    cands21: [{ sigla: 'MTS', nombre: 'José A. Unzueta Shiriqui', color: '#004026' }, { sigla: 'MAS-IPSP', nombre: 'Ernesto Suárez Molina', color: '#0400ff' }, { sigla: 'TODOS', nombre: 'Fernando Aponte Larach', color: '#047631' }, { sigla: 'AHORA!', nombre: 'Jeanine Áñez Chávez', color: '#900C3F' }, { sigla: 'UNEBENI', nombre: 'Julio A. Uzquiano Howard', color: '#006636' }, { sigla: 'FPV', nombre: 'Marcial Fabricano Noé', color: '#165f4c' }],
    gan21: { nombre: 'José A. Unzueta Shiriqui', sigla: 'MTS', pct: 41.79, color: '#004026' },
    gan15: { nombre: 'Alex Ferrier Abidar', sigla: 'MAS-IPSP', pct: 50.23, color: '#0400ff' },
    sv: null,
    territorio21: [
      { n: 'MONICA NUÃ‘EZ VELA SCHRACKMANN', s: 'MTS', g: 'FEMENINO', c: '#004026', p: 'Yacuma' },
      { n: 'LUIS FERNANDO PEREIRA REA', s: 'MTS', g: 'MASCULINO', c: '#004026', p: 'Yacuma' },
      { n: 'EDGAR SEGUNDO REA AVAROMA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Yacuma' },
      { n: 'MARCELO VARGAS CHOLIMA', s: 'MTS', g: 'MASCULINO', c: '#004026', p: 'Cercado' },
      { n: 'BOLIVIA VACA ZABALA', s: 'MTS', g: 'FEMENINO', c: '#004026', p: 'Cercado' },
      { n: 'LIMBERT HERBAS VILLARROEL', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Cercado' },
      { n: 'JUAN AGREDA MORENO', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Iténez' },
      { n: 'JENNY PARADA MOPI', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Iténez' },
      { n: 'JORGE CUELLAR RODRÍGUEZ', s: 'TODOS', g: 'MASCULINO', c: '#047631', p: 'Iténez' },
      { n: 'DINO NATE AÑEZ', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'José Ballivian' },
      { n: 'MARTHA MAMANI LUQUE', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'José Ballivian' },
      { n: 'SELVA ROSA BALDERRAMA HURTADO', s: 'TODOS', g: 'FEMENINO', c: '#047631', p: 'José Ballivian' },
      { n: 'OSVALDO EDWIN ROMAN PARADA', s: 'TODOS', g: 'MASCULINO', c: '#047631', p: 'Mamoré' },
      { n: 'BELZA RIBERA LEIGUE', s: 'TODOS', g: 'FEMENINO', c: '#047631', p: 'Mamoré' },
      { n: 'KATIUSKA FIGUEROA ROJAS', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Mamoré' },
      { n: 'GABY VANIA BALCAZAR RIBERA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Marbán' },
      { n: 'FREDY ORTIZ CAMPOS', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Marbán' },
      { n: 'ROSSANA KENAP RIOJA', s: 'MTS', g: 'FEMENINO', c: '#004026', p: 'Marbán' },
      { n: 'CECILIA GIRALDO JUSTINIANO', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Moxos' },
      { n: 'RAFAEL EMMANUEL PABON ARIAS', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: 'Moxos' },
      { n: 'YOISSY YAMILA ZELADA VIANA', s: 'TODOS', g: 'FEMENINO', c: '#047631', p: 'Moxos' },
      { n: 'HUANGER AVILA VALERA', s: 'MTS', g: 'MASCULINO', c: '#004026', p: 'Vaca Diéz' },
      { n: 'CASTA KARINA SALINAS CURY', s: 'MTS', g: 'FEMENINO', c: '#004026', p: 'Vaca Diéz' },
      { n: 'EVELIN GONZALES BALLON', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Vaca Diéz' }
    ],
    poblacion21: [

    ],
    indigena21: [
      { n: 'JORGE AÑEZ', s: 'Pueblo Tsiman', g: 'MASCULINO', c: '#8B5E3C', p: '' },
      { n: 'BERTHA VEJARANO', s: 'Mojeño', g: 'FEMENINO', c: '#8B5E3C', p: '' },
      { n: '*PENDIENTE DE SUPERVISIÓN', s: 'Pueblo Campesino', g: 'MASCULINO', c: '#8B5E3C', p: '' },
      { n: '*PENDIENTE DE SUPERVISIÓN', s: 'Pueblo Campesino', g: 'MASCULINO', c: '#8B5E3C', p: '' }
    ],
    secretarios21: [

    ],
    territorio15: [
      { n: 'RONNY ARMANDO SUAREZ ALVARADO', s: 'NACER', g: 'MASCULINO', c: '#fccc00', p: '' },
      { n: 'CARMEN ALGARAÑAZ MONTERO', s: 'NACER', g: 'FEMENINO', c: '#fccc00', p: '' },
      { n: 'CARLOS ERNESTO NAVIA RIBERA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'CASIMIRO BELTRAN CANAVIRI', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'KARINA ISELA SEQUEIROS', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'LUIS FERNANDO ROCA VACA', s: 'NACER', g: 'MASCULINO', c: '#fccc00', p: '' },
      { n: 'CARLOS PAUL BRUCKNER BARBA', s: 'MNR', g: 'MASCULINO', c: '#ed83ab', p: '' },
      { n: 'MIRIAN ARMINDA JIMENEZ MENDOZA', s: 'MNR', g: 'FEMENINO', c: '#ed83ab', p: '' },
      { n: 'JOSE ANTONIO OYOLA SUAREZ', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'ELENA RIOS SANGUINO', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'HERMOGENES ARAMAYO MONTERO', s: 'NACER', g: 'MASCULINO', c: '#fccc00', p: '' },
      { n: 'YASCARA MORENO FLORES', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'ADALBERTO ARAUZ GONZALES', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'DAMIAN BRITO VARGAS', s: 'NACER', g: 'MASCULINO', c: '#fccc00', p: '' },
      { n: 'ROSMERY AYALA LANGUIDEY', s: 'NACER', g: 'FEMENINO', c: '#fccc00', p: '' },
      { n: 'JUAN CARLOS SANTOS CALLE', s: 'NACER', g: 'MASCULINO', c: '#fccc00', p: '' },
      { n: 'JUAN CARLOS VIRUEZ SOSA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'CLARIBEL SANDOVAL SERRATE', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'FRUTO RUIZ MAMA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'EDWARD KURT BRUCKNER ROCA', s: 'MNR', g: 'MASCULINO', c: '#ed83ab', p: '' },
      { n: 'JOSE LUIS RIBERA BALCAZAR', s: 'MNR', g: 'MASCULINO', c: '#ed83ab', p: '' },
      { n: 'YACKELINE MERCADO PEREDO', s: 'MNR', g: 'FEMENINO', c: '#ed83ab', p: '' },
      { n: 'MARIA ROXANA NACIF BARBOZA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' }
    ],
    poblacion15: [],
    indigena15: [
      { n: 'CRISTIAN MENECES JUSTINIANO', s: 'YURACARE', g: 'MASCULINO', c: '#888888', p: '' },
      { n: 'Ana Maria Arana Cuellar', s: 'CMIB', g: 'FEMENINO', c: '#888888', p: '' },
      { n: 'Fanor Amapo Yubanera', s: 'CIRABO', g: 'MASCULINO', c: '#888888', p: '' }
    ],
  },
  '909': {
    nombre: 'Pando',
    cands21: [{ sigla: 'MTS', nombre: 'Regis G. Richter Alencár', color: '#004026' }, { sigla: 'MAS-IPSP', nombre: 'Miguel Becerra Suárez', color: '#0400ff' }, { sigla: 'CID', nombre: 'Carmen Eva González', color: '#bc0f5f' }, { sigla: 'FPV', nombre: 'Cand. FPV Pando', color: '#165f4c' }],
    gan21: { nombre: 'Regis G. Richter Alencár', sigla: 'MTS', pct: 54.69, color: '#004026' },
    gan15: { nombre: 'Luis Adolfo Flores Robert', sigla: 'MAS-IPSP', pct: 66.73, color: '#0400ff' },
    sv: { diferencia: 1053, ganador2vPct: 54.69, candidatos1v: [{ sigla: 'MAS-IPSP', nombre: 'Miguel Becerra Suárez', pct1v: 40.99, color: '#0400ff' }, { sigla: 'MTS', nombre: 'Regis G. Richter Alencár', pct1v: 39.0, color: '#004026' }] },
    territorio21: [
      { n: 'LITZI KATHERINE CACHI VARGAS', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'ALDO CORDERO HUANUIRI', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'OLGA FELICIANO AMPUERO', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'ZENÓN VALERIANO QUISPE YUJRA', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'MARÍA RAMÍREZ AJNO', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'FAVIO DURÁN MÉNDEZ', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'ALBERTINA AGUILERA ROCA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'JOSUÉ OLMOS QUETEGUARI', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'HANSY GONZALES AGUIRRE', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'GUILLERMO AGUIRRE DAN', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'LEANDRO CORIA GARCÍA', s: 'P.S.T.', g: 'MASCULINO', c: '#ffffff', p: '' },
      { n: 'JORGE SUÁREZ NAVI', s: 'CID', g: 'MASCULINO', c: '#bc0f5f', p: '' },
      { n: 'GORGINA RIVERO CHAO', s: 'MDA', g: 'FEMENINO', c: '#06ae3b', p: '' },
      { n: 'RUTH INUMA MAMANI', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'CLAUDIA PATRICIA CANAMARI MELGAR', s: 'CID', g: 'FEMENINO', c: '#bc0f5f', p: '' }
    ],
    poblacion21: [
      { n: 'KEILA TIRINA PERALTA', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Madre de Dios' },
      { n: 'DORIS DOMINGUEZ ECUARI', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: 'Nicolás Suarez' },
      { n: 'MARIANELA ALVAREZ SUAREZ', s: 'MTS', g: 'FEMENINO', c: '#004026', p: 'Nicolás Suarez' }
    ],
    indigena21: [
      { n: 'JIM MEDINA SALAS', s: 'PANDO', g: 'MASCULINO', c: '#8B5E3C', p: '' },
      { n: 'RUDERCINDO TABO VACA', s: 'PANDO', g: 'MASCULINO', c: '#8B5E3C', p: '' },
      { n: 'ALMIR FLORES MUZUMBITE', s: 'PANDO', g: 'MASCULINO', c: '#8B5E3C', p: '' }
    ],
    secretarios21: [

    ],
    territorio15: [
      { n: 'Tania Alvare Inuma', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Oscar Antonio Camacho Cuellar', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Flora Gómez Quea', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Roy Suarez Medina', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Osmar Aradiez Grande', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Marcial Queteguary Crespo', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Bella Esther Aguilera Roca', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Yasminee Amara Mory', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Wilso Quiñones Ugarte', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Brid Vega Arredondo', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Ronald Telleria  Palomequi', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Leonardo Severo Apaza Quispe', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Eduardo Flores Queteguaro', s: 'MAS-IPSP', g: 'MASCULINO', c: '#0400ff', p: '' },
      { n: 'Mirtha Vargas Matareco', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Rolando Salvatierra Mendez', s: 'PUD', g: 'MASCULINO', c: '#03E953', p: '' }
    ],
    poblacion15: [
      { n: 'Magda Kerdy Aguilera', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' },
      { n: 'Eliana Rina Acosta Quispe', s: 'PUD', g: 'FEMENINO', c: '#03E953', p: '' },
      { n: 'Adriana Campos Padilla', s: 'MAS-IPSP', g: 'FEMENINO', c: '#0400ff', p: '' }
    ],
    indigena15: [
      { n: 'Durimar Merelis Genaro', s: 'Yaminagua', g: 'MASCULINO', c: '#888888', p: '' },
      { n: 'Beatriz Navi Villanueva', s: 'Tacana', g: 'FEMENINO', c: '#888888', p: '' },
      { n: 'Pacheco Monje Martín', s: 'Esse Ejja', g: 'MASCULINO', c: '#888888', p: '' }
    ],
  },
}

// ─────────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────────
function inRing(lat: number, lng: number, ring: number[][]) {
  let inside = false; const n = ring.length
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [x1, y1] = ring[i]; const [x2, y2] = ring[j]
    if ((y1 > lat) !== (y2 > lat) && lng < ((x2 - x1) * (lat - y1)) / (y2 - y1) + x1) inside = !inside
  }
  return inside
}
function detectarDepto(lat: number, lng: number, gj: FeatureCollection): Feature | null {
  return gj.features.find(f => {
    const g = f.geometry
    if (g.type === 'Polygon') return inRing(lat, lng, g.coordinates[0])
    if (g.type === 'MultiPolygon') return g.coordinates.some(p => inRing(lat, lng, p[0]))
    return false
  }) ?? null
}
function ClickHandler({ fn }: { fn: (lat: number, lng: number) => void }) {
  useMapEvents({ click: e => fn(e.latlng.lat, e.latlng.lng) })
  return null
}
function textColor(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 155 ? '#222' : '#fff'
}

// ─────────────────────────────────────────────────────────────────
// SILUETA SVG con tooltip (title nativo del SVG)
// ─────────────────────────────────────────────────────────────────
function Silueta({ a, size = 13 }: { a: A; size?: number }) {
  const esFem = a.g === 'FEMENINO'
  const tip = `${a.n}\n${a.s}${a.p ? '\n' + a.p : ''}`
  return (
    <svg width={size} height={size * 1.9} viewBox="0 0 20 38"
      style={{ display: 'block', flexShrink: 0, cursor: 'help' }}
      aria-label={tip}>
      <title>{tip}</title>
      <circle cx="10" cy="5" r="4.5" fill={a.c} />
      {esFem ? (
        <>
          <path d="M6 11 Q10 15 14 11 L17 24 H3 Z" fill={a.c} />
          <line x1="6" y1="24" x2="4" y2="36" stroke={a.c} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="14" y1="24" x2="16" y2="36" stroke={a.c} strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <rect x="5" y="11" width="10" height="12" rx="2" fill={a.c} />
          <line x1="7" y1="23" x2="5" y2="36" stroke={a.c} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="13" y1="23" x2="15" y2="36" stroke={a.c} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────
// GRID ASAMBLEÍSTAS
// ─────────────────────────────────────────────────────────────────
function GridAsambleistas({ lista, titulo, icono }: { lista: A[]; titulo: string; icono: string }) {
  if (!lista.length) return null
  const orden: string[] = []
  const grupos: Record<string, A[]> = {}
  lista.forEach(a => {
    if (!grupos[a.s]) { grupos[a.s] = []; orden.push(a.s) }
    grupos[a.s].push(a)
  })
  const masc = lista.filter(a => a.g === 'MASCULINO').length
  const fem = lista.filter(a => a.g === 'FEMENINO').length
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingBottom: 4, borderBottom: '1.5px solid #eef' }}>
        <span style={{ fontSize: 14 }}>{icono}</span>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: '#333' }}>{titulo}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, fontSize: 10, fontWeight: 700 }}>
          <span style={{ background: '#eef3ff', borderRadius: 10, padding: '1px 7px', color: '#1565C0' }}>♂{masc}</span>
          <span style={{ background: '#fff0f6', borderRadius: 10, padding: '1px 7px', color: '#c2185b' }}>♀{fem}</span>
          <span style={{ background: '#f4f4f4', borderRadius: 10, padding: '1px 7px', color: '#555' }}>Σ{lista.length}</span>
        </div>
      </div>
      {orden.map(sigla => {
        const mb = grupos[sigla]; const col = mb[0].c
        const m = mb.filter(x => x.g === 'MASCULINO').length; const f = mb.filter(x => x.g === 'FEMENINO').length
        return (
          <div key={sigla} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: col, flexShrink: 0 }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: '#222' }}>{sigla}</span>
              <span style={{ fontSize: 10, color: '#888' }}>({m + f})</span>
              {m > 0 && <span style={{ fontSize: 10, color: '#1565C0', fontWeight: 700 }}>♂{m}</span>}
              {f > 0 && <span style={{ fontSize: 10, color: '#c2185b', fontWeight: 700 }}>♀{f}</span>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, paddingLeft: 15 }}>
              {mb.filter(x => x.g === 'MASCULINO').map((a, i) => <Silueta key={`m${i}`} a={a} size={13} />)}
              {mb.filter(x => x.g === 'FEMENINO').map((a, i) => <Silueta key={`f${i}`} a={a} size={13} />)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// PANEL INDÍGENAS
// ─────────────────────────────────────────────────────────────────
function PanelIndigenas({ lista, ganColor }: { lista: A[]; ganColor: string }) {
  if (!lista.length) return null
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingBottom: 4, borderBottom: '1.5px solid #f0e8d8' }}>
        <span style={{ fontSize: 14 }}>🪶</span>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: '#7a5c30' }}>Asambleístas Indígenas</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, background: '#f5ede0', borderRadius: 10, padding: '1px 7px', color: '#7a5c30', fontWeight: 700 }}>{lista.length} escaños</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {lista.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'linear-gradient(135deg,#fdf8f2,#f8ede0)', borderRadius: 8, border: '1px solid #ead5b8' }}>
            <Silueta a={a} size={14} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.n}</div>
              <div style={{ fontSize: 10, color: '#9a7040', fontStyle: 'italic' }}>{a.s}</div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: a.g === 'FEMENINO' ? '#c2185b' : '#1565C0' }}>{a.g === 'FEMENINO' ? '♀' : '♂'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// PANEL DERECHO COMPLETO
// ─────────────────────────────────────────────────────────────────
function PanelDepto({ cod, anio }: { cod: string | null; anio: '2015' | '2021' }) {
  if (!cod) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10 }}>
      <svg width="50" height="60" viewBox="0 0 50 60">
        <path d="M25 3 L47 18 L47 55 L3 55 L3 18 Z" fill="none" stroke="#e0e0e0" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="25" cy="38" r="7" fill="#e8e8e8" />
      </svg>
      <span style={{ fontSize: 13, color: '#bbb' }}>Selecciona un departamento en el mapa</span>
    </div>
  )
  const d = DEPTOS[cod]; if (!d) return null
  const ganador = anio === '2021' ? d.gan21 : d.gan15
  const cands = anio === '2021' ? d.cands21 : []
  const sv = anio === '2021' ? d.sv : null
  const gc = ganador?.color ?? '#888'
  const territorio = anio === '2021' ? d.territorio21 : d.territorio15
  const poblacion = anio === '2021' ? d.poblacion21 : d.poblacion15
  const indigena = anio === '2021' ? d.indigena21 : d.indigena15

  return (
    <div style={{ paddingBottom: 24 }}>

      {/* ── Gobernador electo */}
      <div style={{ borderLeft: `5px solid ${gc}`, background: `${gc}0e`, borderRadius: '0 10px 10px 0', padding: '11px 14px', marginBottom: 16 }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#888', marginBottom: 3 }}>
          Gobernador/a electo/a {anio}{sv ? ` (2ª vuelta — ${sv.ganador2vPct.toFixed(2)}%)` : ` — ${ganador?.pct.toFixed(2)}%`}
        </div>
        <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.3, marginBottom: 6 }}>{ganador?.nombre ?? '—'}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
          <span style={{ background: gc, color: textColor(gc), fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 5 }}>{ganador?.sigla}</span>
          {sv
            ? <span style={{ fontSize: 10, background: '#fff9e6', color: '#b87800', padding: '2px 8px', borderRadius: 4, border: '1px solid #ffc107', fontWeight: 700 }}>⚡ Pasó a 2ª vuelta</span>
            : <span style={{ fontSize: 15, fontWeight: 800, color: gc }}>{ganador?.pct.toFixed(2)}%</span>
          }
        </div>
      </div>

      {/* ── Candidatos 1ª vuelta (solo 2021) */}
      {anio === '2021' && cands.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: '#555', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span>📋</span> 1ª Vuelta — {cands.length} candidatos
          </div>
          {cands.map((c, i) => {
            const esG = c.sigla === ganador?.sigla
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 9px', borderRadius: 7, marginBottom: 3, background: esG ? `${c.color}14` : '#fafafa', border: `1px solid ${esG ? c.color + '44' : '#eee'}` }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: esG ? 700 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nombre}</div>
                  <div style={{ fontSize: 10, color: '#999' }}>{c.sigla}</div>
                </div>
                {esG && !sv && <span style={{ fontSize: 12, fontWeight: 800, color: c.color, flexShrink: 0 }}>{ganador!.pct.toFixed(1)}%</span>}
                {esG && <span style={{ fontSize: 12 }}>🏆</span>}
              </div>
            )
          })}
        </div>
      )}

      {/* ── BLOQUE SEGUNDA VUELTA con datos correctos */}
      {sv && (
        <div style={{ marginBottom: 16, border: '2px solid #ffc107', borderRadius: 10, overflow: 'hidden' }}>
          {/* Header primera vuelta */}
          <div style={{ background: '#fff9e6', padding: '8px 12px', borderBottom: '1px solid #ffc107', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 15 }}>📊</span>
            <span style={{ fontWeight: 800, fontSize: 11, color: '#9a6700', textTransform: 'uppercase', letterSpacing: 0.6 }}>1ª Vuelta (pasó a 2ª)</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, background: '#fff', border: '1px solid #ffc107', borderRadius: 4, padding: '2px 7px', color: '#9a6700' }}>
              Dif. 2ª vuelta: {sv.diferencia.toLocaleString()} votos
            </span>
          </div>
          {/* Barras primera vuelta */}
          <div style={{ padding: '10px 12px', background: '#fffcf0' }}>
            {sv.candidatos1v.map((c, i) => {
              const maxP = Math.max(...sv.candidatos1v.map(x => x.pct1v))
              const esMayor = c.pct1v === maxP
              return (
                <div key={i} style={{ marginBottom: i < sv.candidatos1v.length - 1 ? 10 : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 9, height: 9, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: 11, fontWeight: esMayor ? 700 : 400 }}>{c.nombre}</span>
                        <span style={{ fontSize: 10, color: '#888', marginLeft: 5 }}>{c.sigla}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: c.color }}>{c.pct1v.toFixed(2)}%</span>
                  </div>
                  <div style={{ height: 8, background: '#f0e8c0', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min((c.pct1v / 55) * 100, 100)}%`, background: c.color, borderRadius: 5, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
          {/* Footer segunda vuelta */}
          <div style={{ background: '#fff3e0', padding: '8px 12px', borderTop: '1px solid #ffc107', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13 }}>⚡</span>
            <span style={{ fontSize: 10, color: '#9a6700', fontWeight: 600 }}>2ª Vuelta — ganó</span>
            <span style={{ fontWeight: 800, fontSize: 11, color: gc }}>{ganador?.nombre}</span>
            <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 800, color: gc }}>{sv.ganador2vPct.toFixed(2)}%</span>
          </div>
        </div>
      )}

      {/* ── ASAMBLEÍSTAS */}
      <GridAsambleistas lista={territorio} titulo="Asambleístas por Territorio" icono="🗺️" />
      <GridAsambleistas lista={poblacion} titulo="Asambleístas por Población" icono="👥" />
      <PanelIndigenas lista={indigena} ganColor={gc} />

      {/* ── SECRETARIOS (solo 2021 y si hay datos) */}
      {anio === '2021' && d.secretarios21.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingBottom: 4, borderBottom: '1.5px solid #eef' }}>
            <span style={{ fontSize: 14 }}>🏛️</span>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: '#333' }}>Secretarios de Despacho</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {d.secretarios21.map((s, i) => (
              <div key={i} style={{ padding: '6px 10px', borderRadius: 7, borderLeft: `4px solid ${gc}`, background: '#f8f9ff' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#333' }}>{s.cargo}</div>
                <div style={{ fontSize: 10, color: '#777', marginTop: 1 }}>{s.n}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────
export default function MapaEleccionesCompleto() {
  const CENTRO: LatLngExpression = [-16.40, -64.17]
  const mapRef = useRef<L.Map | null>(null)
  const geoJSONRef = useRef<L.GeoJSON | null>(null)
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [anio, setAnio] = useState<'2015' | '2021'>('2021')
  const [deptoActivo, setDeptoActivo] = useState<string | null>(null)

  useEffect(() => {
    getDataGeneralFinal('GAD').then(d => { setGeojson(d as FeatureCollection); setIsLoading(false) })
  }, [])
  useEffect(() => { setDeptoActivo(null) }, [anio])

  const getColor = useCallback((cod: string) => {
    const d = DEPTOS[cod]
    return (anio === '2021' ? d?.gan21?.color : d?.gan15?.color) ?? '#aaa'
  }, [anio])

  const estiloFeature = useCallback((feature?: Feature) => {
    const cod = String(feature?.properties?.c_ut_dep ?? '')
    return { color: '#fff', weight: deptoActivo === cod ? 3 : 1, fillColor: getColor(cod), fillOpacity: deptoActivo === cod ? 0.95 : 0.78 }
  }, [getColor, deptoActivo])

  const onEachFeature = useCallback((feature: Feature, layer: L.Layer) => {
    const cod = String(feature?.properties?.c_ut_dep ?? '')
    const d = DEPTOS[cod]
    const g = anio === '2021' ? d?.gan21 : d?.gan15
    layer.bindTooltip(g
      ? `<b style="font-size:13px">${d.nombre}</b><br/><span style="color:${g.color};font-weight:700">${g.sigla}</span> — ${g.pct.toFixed(1)}%<br/><span style="font-size:11px;color:#555">${g.nombre}</span>`
      : (d?.nombre ?? cod), { sticky: true, opacity: 1 })
    layer.on({
      mouseover(e) { (e.target as L.Path).setStyle({ weight: 2.5, fillOpacity: 0.92 }); (e.target as L.Path).bringToFront() },
      mouseout(e) { const s = deptoActivo === cod; (e.target as L.Path).setStyle({ weight: s ? 3 : 1, fillOpacity: s ? 0.95 : 0.78 }) },
    })
  }, [anio, deptoActivo])

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (!geojson) return
    const feat = detectarDepto(lat, lng, geojson)
    const cod = feat ? String(feat.properties?.c_ut_dep ?? '') : null
    if (cod && DEPTOS[cod]) {
      setDeptoActivo(cod)
      if (mapRef.current && geoJSONRef.current)
        geoJSONRef.current.eachLayer((l: any) => {
          if (String(l.feature?.properties?.c_ut_dep) === cod)
            mapRef.current!.flyToBounds(l.getBounds(), { duration: 0.8, padding: [35, 35] })
        })
    } else {
      setDeptoActivo(null)
      mapRef.current?.flyTo(CENTRO, 6, { duration: 0.8 })
    }
  }, [geojson])

  const leyenda = useMemo(() => {
    const m: Record<string, string> = {}
    Object.values(DEPTOS).forEach(d => {
      const g = anio === '2021' ? d.gan21 : d.gan15
      if (g) m[g.sigla] = g.color
    })
    return Object.entries(m)
  }, [anio])

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", height: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f6fb', overflow: 'hidden' }}>

      {/* HEADER */}
      <header style={{ padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#16213e', color: '#fff', flexShrink: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 6, height: 34, borderRadius: 3, background: 'linear-gradient(180deg,#e94560,#f5a623)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.4 }}>Elecciones Subnacionales — Bolivia</div>
            <div style={{ fontSize: 11, color: '#7788aa' }}>Gobernaciones · Hover sobre siluetas para ver nombre y provincia</div>
          </div>
        </div>
        <div style={{ display: 'flex', background: '#0f172a', borderRadius: 8, overflow: 'hidden', border: '1px solid #2a3550' }}>
          {(['2015', '2021'] as const).map(a => (
            <button key={a} onClick={() => setAnio(a)} style={{ padding: '7px 24px', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 14, transition: 'all 0.2s', background: anio === a ? '#e94560' : 'transparent', color: anio === a ? '#fff' : '#556080' }}>{a}</button>
          ))}
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* COLUMNA 1 — Mapa */}
        <div style={{ flex: '0 0 58%', position: 'relative', borderRight: '1px solid #dde3f0' }}>
          {isLoading
            ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa', fontSize: 14 }}>Cargando mapa…</div>
            : geojson && (
              <MapContainer ref={mapRef} center={CENTRO} zoom={6} minZoom={5} scrollWheelZoom style={{ width: '100%', height: '100%' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" attribution="&copy; CartoDB" />
                <GeoJSON key={`${anio}-${deptoActivo ?? 'x'}`} ref={geoJSONRef} data={geojson} style={estiloFeature} onEachFeature={onEachFeature} />
                <ClickHandler fn={handleMapClick} />
              </MapContainer>
            )
          }
          <div style={{ position: 'absolute', bottom: 18, left: 14, zIndex: 1000, background: 'rgba(255,255,255,0.97)', borderRadius: 9, padding: '9px 13px', boxShadow: '0 3px 12px rgba(0,0,0,0.12)' }}>
            <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#999', marginBottom: 7 }}>Partido ganador {anio}</div>
            {leyenda.map(([sigla, color]) => (
              <div key={sigla} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
                <span style={{ fontSize: 10, fontWeight: 500 }}>{sigla}</span>
              </div>
            ))}
          </div>
          {deptoActivo && (
            <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: '#16213e', color: '#fff', padding: '5px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, boxShadow: '0 2px 10px rgba(0,0,0,0.35)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}>
              {DEPTOS[deptoActivo]?.nombre}
              <button onClick={() => { setDeptoActivo(null); mapRef.current?.flyTo(CENTRO, 6, { duration: 0.8 }) }} style={{ background: 'none', border: 'none', color: '#8899bb', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>✕</button>
            </div>
          )}
        </div>

        {/* COLUMNA 2 — Panel */}
        <div style={{ flex: '0 0 42%', display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden' }}>
          <div style={{ padding: '8px 16px', borderBottom: '1px solid #eef0f8', background: '#fafbff', flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#8899bb' }}>
              {deptoActivo ? `${DEPTOS[deptoActivo]?.nombre} · ${anio}` : `Haz clic en un departamento · ${anio}`}
            </span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
            <PanelDepto cod={deptoActivo} anio={anio} />
          </div>
        </div>

      </div>
    </div>
  )
}