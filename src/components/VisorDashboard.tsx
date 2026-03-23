'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
    Box,
    Typography,
    Grid,
    IconButton,
    Tabs,
    Tab,
    Autocomplete,
    TextField
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import { tipoGobierno } from '@/types/map/entidad.interface';

interface Props {
    onClose: () => void;
}

const DynamicMap = dynamic(() => import('@/components/map/MapaGeneral'), { ssr: false });

interface EtaData {
    id: string;
    tipo: string;
    depto: string;
    eta: string;
    direccion: string;
    telefono: string;
    paginaweb: string;
    codINE: string;
}

export default function VisorDashboard({ onClose }: Props) {
    const [etaList, setEtaList] = useState<EtaData[]>([]);
    const [activeNivel, setActiveNivel] = useState<tipoGobierno>('GAM');
    const [eleccionYear, setEleccionYear] = useState<string>('2021');
    const [selectedCodigo, setSelectedCodigo] = useState<string | null>(null);
    const [filterDepto, setFilterDepto] = useState<string | null>(null);
    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => {
        // Un ligero delay antes de mostrar los tabs permite que la animación growAndAppear
        // se inicialice en el layout del DOM y MUI Tabs pueda calcular su width de tinta (ink indicator).
        const tm = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(tm);
    }, []);

    // Fetch ETAs for search
    useEffect(() => {
        const fetchEtas = async () => {
            try {
                const res = await fetch('https://seamovil.com/app/observatorio/readEtas/');
                const data = await res.json();
                if (Array.isArray(data)) setEtaList(data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchEtas();
    }, []);

    const handleFeatureClick = (properties: any) => {
        if (properties && properties.c_ut_dep) {
            setSelectedCodigo(properties.c_ut_dep.toString());
            if (activeNivel === 'GAD') {
                setActiveNivel('GAM');
                if (properties.nom_dpto) {
                    setFilterDepto(properties.nom_dpto);
                }
            } else if (activeNivel === 'GAM') {
                // Ya estamos en GAM
            }
        }
    };

    const getIframeUrl = () => {
        if (!selectedCodigo) return null;
        let scriptName = 'ficha_municipal.php';
        if (activeNivel === 'GAD') scriptName = 'ficha_departamental.php';
        if (activeNivel === 'GAR') scriptName = 'ficha_regional.php';
        if (activeNivel === 'GAIOC') scriptName = 'ficha_indigena.php';

        return `https://seamovil.com/app/fichas/${scriptName}?id=${selectedCodigo}&eleccion=${eleccionYear}`;
    };

    const iframeUrl = getIframeUrl();

    return (
        <Box sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            zIndex: 2,
            padding: '120px 40px 40px 40px',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(12px)',
            transition: 'opacity 0.5s',
            animation: 'growAndAppear 0.9s cubic-bezier(0.7,0,0.3,1) forwards',
            color: '#fff',
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-thumb': { background: '#08B0A7', borderRadius: '4px' }
        }}>
            <IconButton
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    top: 80,
                    right: 40,
                    color: '#08B0A7',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    '&:hover': { background: 'rgba(255, 255, 255, 0.15)' },
                    zIndex: 10
                }}
            >
                <CloseOutlinedIcon />
            </IconButton>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', width: '100%', maxWidth: '1400px' }}>
                <MapOutlinedIcon sx={{ fontSize: 40, color: '#08B0A7' }} />
                <Typography variant="h4" sx={{
                    fontFamily: 'sinkin_sans200_x_light',
                    fontWeight: 700,
                    color: '#fff'
                }}>
                    Visor de Datos Georreferenciadoss
                </Typography>
            </div>

            <Box sx={{
                width: '100%',
                maxWidth: '1400px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                gap: '20px',
                flexDirection: 'column',
                flexGrow: 1,
                minHeight: '70vh',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={4}>
                        {mounted && (
                            <Tabs
                                value={activeNivel}
                                onChange={(e, v) => { setActiveNivel(v); setSelectedCodigo(null); setFilterDepto(null); }}
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{
                                    '& .MuiTab-root': { color: '#ccc', fontFamily: 'sinkin_sans200_x_light' },
                                    '& .Mui-selected': { color: '#08B0A7 !important', fontWeight: 'bold' },
                                    '& .MuiTabs-indicator': { backgroundColor: '#08B0A7' }
                                }}
                            >
                                <Tab value="GAD" label="GAD" />
                                <Tab value="GAM" label="GAM" />
                                <Tab value="GAR" label="GAR" />
                                <Tab value="GAIOC" label="GAIOC" />
                            </Tabs>
                        )}
                    </Grid>
                    <Grid item xs={12} md={4}>
                        {mounted && (
                            <Tabs
                                value={eleccionYear}
                                onChange={(e, v) => setEleccionYear(v)}
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{
                                    '& .MuiTab-root': { color: '#ccc', fontFamily: 'sinkin_sans200_x_light' },
                                    '& .Mui-selected': { color: '#F79A38 !important', fontWeight: 'bold' },
                                    '& .MuiTabs-indicator': { backgroundColor: '#F79A38' }
                                }}
                            >
                                <Tab value="2015" label="Subnacionales 2015" />
                                <Tab value="2021" label="Subnacionales 2021" />
                                <Tab value="2026" label="Subnacionales 2026" />
                            </Tabs>
                        )}
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Autocomplete
                            options={etaList.filter(e => {
                                if (activeNivel === 'GAD') return e.tipo === 'Gobernacion';
                                if (activeNivel === 'GAM') return parseInt(e.id) > 1000 && parseInt(e.id) < 10000;
                                if (activeNivel === 'GAR') return e.tipo === 'Regional';
                                if (activeNivel === 'GAIOC') return e.tipo === 'Indigena';
                                return true;
                            })}
                            getOptionLabel={(option) => `${option.eta} (${option.depto})`}
                            onChange={(e, val) => {
                                if (val) {
                                    setSelectedCodigo(val.id);
                                    if (val.tipo !== 'Gobernacion') {
                                        setActiveNivel('GAM');
                                        setFilterDepto(val.depto);
                                    } else {
                                        setActiveNivel('GAD');
                                        setFilterDepto(null);
                                    }
                                }
                                else {
                                    setSelectedCodigo(null);
                                    setFilterDepto(null);
                                }
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Buscador por Departamento y Municipio" variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            color: '#fff',
                                            background: 'rgba(0,0,0,0.2)',
                                            borderRadius: '8px',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                            '&:hover fieldset': { borderColor: '#08B0A7' },
                                            '&.Mui-focused fieldset': { borderColor: '#08B0A7' },
                                        },
                                        '& .MuiInputLabel-root': { color: '#ccc' },
                                        '& .MuiInputLabel-root.Mui-focused': { color: '#08B0A7' }
                                    }}
                                />
                            )}
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={3} sx={{ flexGrow: 1 }}>
                    {/* Left Panel - Map */}
                    <Grid item xs={12} md={5} sx={{ height: '600px', display: 'flex' }}>
                        <Box sx={{ flexGrow: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <DynamicMap
                                clickFeature={handleFeatureClick}
                                typeVisualize={activeNivel}
                                selectedEntidad={selectedCodigo ? Number(selectedCodigo) : 0}
                                selectedButton="none"
                                eleccionYear={eleccionYear}
                                filterDepto={filterDepto}
                            />
                        </Box>
                    </Grid>

                    {/* Right Panel - Iframe Dashboard */}
                    <Grid item xs={12} md={7} sx={{ height: '600px', display: 'flex' }}>
                        <Box sx={{ flexGrow: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.95)' }}>
                            {iframeUrl ? (
                                <iframe
                                    src={iframeUrl}
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                    title="Ficha"
                                />
                            ) : (
                                <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography sx={{ color: '#666', fontFamily: 'sinkin_sans200_x_light' }}>
                                        Seleccione una entidad en el mapa o en el buscador para visualizar los paneles
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}
