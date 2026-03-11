'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    IconButton
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

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

interface Props {
    onClose: () => void;
}

const ETAS_ENDPOINTS = {
    Todas: 'https://seamovil.com/app/observatorio/readEtas/',
    Municipio: 'https://seamovil.com/app/observatorio/readEtas/Municipio',
    Gobernacion: 'https://seamovil.com/app/observatorio/readEtas/Gobernacion',
    Regional: 'https://seamovil.com/app/observatorio/readEtas/Regional',
    Indigena: 'https://seamovil.com/app/observatorio/readEtas/Indigena/'
};

const DEPARTAMENTOS = [
    'Todos',
    'Beni',
    'Chuquisaca',
    'Cochabamba',
    'La Paz',
    'Oruro',
    'Pando',
    'Potosí',
    'Santa Cruz',
    'Tarija'
];

export default function DatosFiscalesDashboard({ onClose }: Props) {
    const [activeTab, setActiveTab] = useState<keyof typeof ETAS_ENDPOINTS>('Municipio');
    const [data, setData] = useState<EtaData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [searchDepto, setSearchDepto] = useState<string>('Todos');
    const [searchNombre, setSearchNombre] = useState<string>('');

    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab]);

    const fetchData = async (tipo: keyof typeof ETAS_ENDPOINTS) => {
        setLoading(true);
        try {
            const response = await fetch(ETAS_ENDPOINTS[tipo]);
            const json = await response.json();
            // Ensure it's an array
            setData(Array.isArray(json) ? json : []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = data.filter((item) => {
        const matchDepto = searchDepto === 'Todos' || item.depto?.toLowerCase().includes(searchDepto.toLowerCase());
        const matchNombre = !searchNombre || item.eta?.toLowerCase().includes(searchNombre.toLowerCase());
        return matchDepto && matchNombre;
    });

    return (
        <Box sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            zIndex: 2,
            padding: '120px 40px 120px 40px',
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
                    '&:hover': { background: 'rgba(255, 255, 255, 0.15)' }
                }}
            >
                <CloseOutlinedIcon />
            </IconButton>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <AccountBalanceOutlinedIcon sx={{ fontSize: 40, color: '#31595D' }} />
                <Typography variant="h4" sx={{
                    fontFamily: 'sinkin_sans200_x_light',
                    fontWeight: 700,
                    letterSpacing: 1.5,
                    color: '#fff'
                }}>
                    Datos Fiscales
                </Typography>
            </div>

            <Box sx={{
                width: '100%',
                maxWidth: '1200px',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            }}>
                {/* Filtros */}
                <Grid container spacing={2} sx={{ mb: 4, alignItems: 'center' }}>
                    <Grid item xs={12} sm={4}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {Object.keys(ETAS_ENDPOINTS).map((key) => {
                                const type = key as keyof typeof ETAS_ENDPOINTS;
                                return (
                                    <Box
                                        key={type}
                                        onClick={() => setActiveTab(type)}
                                        sx={{
                                            cursor: 'pointer',
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            fontFamily: 'sinkin_sans200_x_light',
                                            fontSize: '12px',
                                            textTransform: 'uppercase',
                                            fontWeight: activeTab === type ? 700 : 400,
                                            background: activeTab === type ? 'rgba(49, 89, 93, 0.6)' : 'rgba(255, 255, 255, 0.05)',
                                            border: `1px solid ${activeTab === type ? '#31595D' : 'rgba(255, 255, 255, 0.2)'}`,
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                background: 'rgba(49, 89, 93, 0.4)',
                                                borderColor: '#31595D'
                                            }
                                        }}
                                    >
                                        {type}
                                    </Box>
                                )
                            })}
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth variant="outlined" sx={{
                            '& .MuiOutlinedInput-root': {
                                color: '#fff',
                                fontFamily: 'sinkin_sans200_x_light',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: '8px',
                                '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                '&:hover fieldset': { borderColor: '#31595D' },
                                '&.Mui-focused fieldset': { borderColor: '#31595D' },
                            },
                            '& .MuiInputLabel-root': { color: '#ccc', fontFamily: 'sinkin_sans200_x_light' },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#31595D' }
                        }}>
                            <InputLabel>Departamento</InputLabel>
                            <Select
                                value={searchDepto}
                                onChange={(e) => setSearchDepto(e.target.value)}
                                label="Departamento"
                            >
                                {DEPARTAMENTOS.map(d => (
                                    <MenuItem key={d} value={d} sx={{ fontFamily: 'sinkin_sans200_x_light' }}>{d}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Buscar por Nombre / ETA"
                            value={searchNombre}
                            onChange={(e) => setSearchNombre(e.target.value)}
                            InputProps={{
                                endAdornment: <SearchOutlinedIcon sx={{ color: '#ccc' }} />
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: '#fff',
                                    fontFamily: 'sinkin_sans200_x_light',
                                    background: 'rgba(0,0,0,0.2)',
                                    borderRadius: '8px',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                    '&:hover fieldset': { borderColor: '#31595D' },
                                    '&.Mui-focused fieldset': { borderColor: '#31595D' },
                                },
                                '& .MuiInputLabel-root': { color: '#ccc', fontFamily: 'sinkin_sans200_x_light' },
                                '& .MuiInputLabel-root.Mui-focused': { color: '#31595D' }
                            }}
                        />
                    </Grid>
                </Grid>

                {/* Listado */}
                {loading ? (
                    <Box display="flex" justifyContent="center" py={10}>
                        <CircularProgress sx={{ color: '#31595D' }} />
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {filteredData.map((item, idx) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id || idx}>
                                <Card sx={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    backdropFilter: 'blur(4px)',
                                    color: '#fff',
                                    transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        borderColor: '#31595D',
                                        boxShadow: '0 8px 24px rgba(49, 89, 93, 0.4)'
                                    }
                                }}>
                                    <CardContent>
                                        <Typography variant="caption" sx={{ color: '#A6CE3E', fontFamily: 'sinkin_sans200_x_light', fontWeight: 700 }}>
                                            {item.tipo} | {item.depto}
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontFamily: 'sinkin_sans200_x_light', fontWeight: 700, mt: 1, mb: 1, minHeight: '64px' }}>
                                            {item.eta}
                                        </Typography>
                                        <Box sx={{ fontSize: '12px', color: '#ccc', fontFamily: 'sinkin_sans100_thin' }}>
                                            <p style={{ margin: '4px 0' }}><strong>Cód. INE:</strong> {item.codINE || 'N/A'}</p>
                                            <p style={{ margin: '4px 0' }}><strong>Dirección:</strong> {item.direccion || 'N/A'}</p>
                                            <p style={{ margin: '4px 0' }}><strong>Teléfono:</strong> {item.telefono || 'N/A'}</p>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                        {filteredData.length === 0 && (
                            <Box width="100%" textAlign="center" py={6}>
                                <Typography sx={{ fontFamily: 'sinkin_sans200_x_light', color: '#aaa' }}>
                                    No se encontraron resultados.
                                </Typography>
                            </Box>
                        )}
                    </Grid>
                )}
            </Box>
        </Box>
    );
}
