'use client';

import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

interface Props {
    onClose: () => void;
}

const cubeStyle = `
  @keyframes rotateCube {
    0%   { transform: rotateX(0deg)   rotateY(0deg)   rotateZ(0deg); }
    25%  { transform: rotateX(90deg)  rotateY(180deg) rotateZ(45deg); }
    50%  { transform: rotateX(180deg) rotateY(360deg) rotateZ(0deg); }
    75%  { transform: rotateX(270deg) rotateY(180deg) rotateZ(-45deg); }
    100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(0deg); }
  }
  @keyframes pulseGlow {
    0%, 100% { filter: drop-shadow(0 0 8px rgba(8, 176, 167, 0.4)); }
    50%       { filter: drop-shadow(0 0 24px rgba(8, 176, 167, 0.9)); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes growAndAppear {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }

  .cube-scene {
    width: 180px;
    height: 180px;
    perspective: 600px;
  }
  .cube-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    animation: rotateCube 8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite,
               pulseGlow 3s ease-in-out infinite;
  }
  .cube-face {
    position: absolute;
    width: 180px;
    height: 180px;
  }
`;

// Caras del cubo como SVGs individuales con colores distintos
const CubeFace = ({
    transform,
    fillColor,
    strokeColor,
    opacity = 0.18,
}: {
    transform: string;
    fillColor: string;
    strokeColor: string;
    opacity?: number;
}) => (
    <div className="cube-face" style={{ transform }}>
        <svg width="180" height="180" viewBox="0 0 180 180">
            <rect
                x="4" y="4" width="172" height="172" rx="16"
                fill={fillColor}
                fillOpacity={opacity}
                stroke={strokeColor}
                strokeWidth="1.5"
                strokeOpacity="0.7"
            />
            {/* Grid interior decorativo */}
            {[40, 90, 140].map((pos) => (
                <React.Fragment key={pos}>
                    <line x1={pos} y1="4" x2={pos} y2="176"
                        stroke={strokeColor} strokeWidth="0.4" strokeOpacity="0.3" />
                    <line x1="4" y1={pos} x2="176" y2={pos}
                        stroke={strokeColor} strokeWidth="0.4" strokeOpacity="0.3" />
                </React.Fragment>
            ))}
            {/* Punto central */}
            <circle cx="90" cy="90" r="6"
                fill={strokeColor} fillOpacity="0.5" />
            <circle cx="90" cy="90" r="3"
                fill={strokeColor} fillOpacity="0.9" />
        </svg>
    </div>
);

const RotatingCube = () => (
    <>
        <style>{cubeStyle}</style>
        <div className="cube-scene">
            <div className="cube-wrapper">
                {/* Frente */}
                <CubeFace
                    transform="rotateY(0deg) translateZ(90px)"
                    fillColor="#08B0A7"
                    strokeColor="#08B0A7"
                    opacity={0.15}
                />
                {/* Atrás */}
                <CubeFace
                    transform="rotateY(180deg) translateZ(90px)"
                    fillColor="#31595D"
                    strokeColor="#31595D"
                    opacity={0.18}
                />
                {/* Izquierda */}
                <CubeFace
                    transform="rotateY(-90deg) translateZ(90px)"
                    fillColor="#A6CE3E"
                    strokeColor="#A6CE3E"
                    opacity={0.12}
                />
                {/* Derecha */}
                <CubeFace
                    transform="rotateY(90deg) translateZ(90px)"
                    fillColor="#F7931E"
                    strokeColor="#F7931E"
                    opacity={0.12}
                />
                {/* Arriba */}
                <CubeFace
                    transform="rotateX(90deg) translateZ(90px)"
                    fillColor="#08B0A7"
                    strokeColor="#08B0A7"
                    opacity={0.20}
                />
                {/* Abajo */}
                <CubeFace
                    transform="rotateX(-90deg) translateZ(90px)"
                    fillColor="#31595D"
                    strokeColor="#31595D"
                    opacity={0.10}
                />
            </div>
        </div>
    </>
);

export default function HilandoAutonomias({ onClose }: Props) {
    return (
        <Box sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            animation: 'growAndAppear 0.9s cubic-bezier(0.7,0,0.3,1) forwards',
            color: '#fff',
        }}>

            {/* Botón cerrar — idéntico al original */}
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
                    '&:hover': { background: 'rgba(255, 255, 255, 0.15)' }
                }}
            >
                <CloseOutlinedIcon />
            </IconButton>

            {/* Cubo 3D */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '36px',
                animation: 'fadeInUp 1.2s ease forwards',
            }}>
                <RotatingCube />

                {/* Texto debajo del cubo */}
                <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{
                        fontFamily: 'sinkin_sans200_x_light',
                        fontSize: '22px',
                        fontWeight: 700,
                        letterSpacing: '3px',
                        color: '#08B0A7',
                        textTransform: 'uppercase',
                        mb: 1,
                    }}>
                        Hilando las Autonomías
                    </Typography>
                    <Typography sx={{
                        fontFamily: 'sinkin_sans100_thin',
                        fontSize: '13px',
                        color: 'rgba(255,255,255,0.4)',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                    }}>
                        Proximamente
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
