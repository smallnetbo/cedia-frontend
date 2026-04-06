'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Box, Typography, IconButton } from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import BallotOutlinedIcon from '@mui/icons-material/BallotOutlined';

interface Props {
    onClose: () => void;
}

const MapaEleccionesCompleto = dynamic(
    () => import('@/app/bolivia-gobernaciones-segunda-vuelta-api-municipios/mapa-hola-mundo/MapaEleccionesCompleto'),
    {
        ssr: false,
        loading: () => (
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#08B0A7',
                fontFamily: 'sinkin_sans200_x_light',
                fontSize: 16,
                gap: 2,
            }}>
                <Box sx={{
                    width: 32,
                    height: 32,
                    border: '3px solid rgba(8, 176, 167, 0.2)',
                    borderTop: '3px solid #08B0A7',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                    },
                }} />
                Cargando visor de datos…
            </Box>
        ),
    }
);

export default function VisorDatosSeleccionadosDashboard({ onClose }: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const tm = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(tm);
    }, []);

    return (
        <Box sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            zIndex: 2,
            padding: { xs: '100px 12px 20px 12px', md: '120px 40px 40px 40px' },
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(12px)',
            transition: 'opacity 0.5s',
            animation: 'growAndAppear 0.9s cubic-bezier(0.7,0,0.3,1) forwards',
            color: '#fff',
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-thumb': { background: '#08B0A7', borderRadius: '4px' }
        }}>
            {/* Close button */}
            <IconButton
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    top: { xs: 70, md: 80 },
                    right: { xs: 16, md: 40 },
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

            {/* Title */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '20px',
                width: '100%',
                maxWidth: '1400px'
            }}>
                <BallotOutlinedIcon sx={{ fontSize: 40, color: '#08B0A7' }} />
                <Typography variant="h4" sx={{
                    fontFamily: 'sinkin_sans200_x_light',
                    fontWeight: 700,
                    color: '#fff',
                    fontSize: { xs: '1.3rem', md: '2rem' },
                }}>
                    Visor de Datos Seleccionados
                </Typography>
            </Box>

            {/* Content container */}
            <Box sx={{
                width: '100%',
                maxWidth: '1400px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                minHeight: { xs: '65vh', md: '70vh' },
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            }}>
                {mounted && (
                    <Box sx={{
                        width: '100%',
                        height: '100%',
                        flexGrow: 1,
                        minHeight: { xs: '65vh', md: '70vh' },
                        '& > div': {
                            height: '100% !important',
                            minHeight: 'inherit !important',
                        },
                    }}>
                        <MapaEleccionesCompleto />
                    </Box>
                )}
            </Box>
        </Box>
    );
}
