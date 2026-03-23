'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    IconButton,
    ToggleButton,
    ToggleButtonGroup,
    Autocomplete,
    Menu,
    MenuItem,
    Divider,
    Checkbox,
    ListItemText,
    ListSubheader
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import WcOutlinedIcon from '@mui/icons-material/WcOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

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

export default function FichasMunicipalesDashboard({ onClose }: Props) {
    const [data, setData] = useState<EtaData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedEta, setSelectedEta] = useState<EtaData | null>(null);
    const [activeSection, setActiveSection] = useState<string>('Datos Fiscales');
    const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

    // Filter states
    const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedDepartamentos, setSelectedDepartamentos] = useState<string[]>([]);
    const [selectedCategorias, setSelectedCategorias] = useState<string[]>([]);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const DEPARTAMENTOS = [
        'Beni', 'Chuquisaca', 'Cochabamba', 'La Paz', 'Oruro', 
        'Pando', 'Potosí', 'Santa Cruz', 'Tarija'
    ];
    // Asumiendo algunas posibles categorías para el select (A,B,C,D)
    const CATEGORIAS = ['A', 'B', 'C', 'D']; 

    const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setFilterAnchorEl(event.currentTarget);
    };

    const handleFilterClose = () => {
        setFilterAnchorEl(null);
    };

    const handleDeptoToggle = (depto: string) => {
        setSelectedDepartamentos(prev => 
            prev.includes(depto) ? prev.filter(d => d !== depto) : [...prev, depto]
        );
    };

    const handleCategoriaToggle = (cat: string) => {
        setSelectedCategorias(prev => 
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://seamovil.com/app/observatorio/readEtas/Municipio');
            const json = await response.json();
            setData(Array.isArray(json) ? json : []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = data.filter((item) => {
        let matchSearch = !selectedEta || item.id === selectedEta.id;
        let matchDepto = selectedDepartamentos.length === 0 || selectedDepartamentos.includes(item.depto);
        // Nota: Asumiendo que el campo 'categoria' viniera en la API, si no existe o se llama distinto, 
        // deberá ajustarse. De momento el filtro operará validando que exista.
        let matchCat = selectedCategorias.length === 0 || selectedCategorias.includes((item as any).categoria);
        return matchSearch && matchDepto && matchCat;
    }).sort((a, b) => {
        if (sortOrder === 'asc') return a.eta.localeCompare(b.eta);
        return b.eta.localeCompare(a.eta);
    });

    const handleSectionChange = (
        event: React.MouseEvent<HTMLElement>,
        newSection: string | null,
    ) => {
        if (newSection !== null) {
            setActiveSection(newSection);
        }
    };

    const handleViewChange = (
        event: React.MouseEvent<HTMLElement>,
        newView: 'cards' | 'list' | null,
    ) => {
        if (newView !== null) {
            setViewMode(newView);
        }
    };

    const sections = [
        { value: 'Datos Fiscales', label: 'Datos Fiscales', icon: <AccountBalanceOutlinedIcon />, color: '#31595D' },
        { value: 'Estadísticas en Materia de Género', label: 'Estadísticas en Materia de Género', icon: <WcOutlinedIcon />, color: '#8A328C' },
        { value: 'Derechos Sexuales y Reproductivos', label: 'Derechos Sexuales y Reproductivos', icon: <FavoriteBorderOutlinedIcon />, color: '#FDAC49' },
    ];

    return (
        <Box sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            zIndex: 100000,
            padding: '120px 40px 40px 40px',
            transition: 'opacity 0.5s',
            animation: 'growAndAppear 0.9s cubic-bezier(0.7,0,0.3,1) forwards',
            color: '#fff',
            overflow: 'hidden',
            //background: 'rgba(0, 0, 0, 0.85)',
            //backdropFilter: 'blur(10px)',
        }}>
            <IconButton
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    top: 80,
                    right: 40,
                    color: '#A6CE3E',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    '&:hover': { background: 'rgba(255, 255, 255, 0.15)' }
                }}
            >
                <CloseOutlinedIcon />
            </IconButton>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                <AssessmentOutlinedIcon sx={{ fontSize: 40, color: '#A6CE3E' }} />
                <Typography variant="h4" sx={{
                    fontFamily: 'sinkin_sans200_x_light',
                    fontWeight: 700,
                    letterSpacing: 1.5,
                    color: '#fff'
                }}>
                    Fichas Municipales
                </Typography>
            </div>

            <Box sx={{
                width: '100%',
                maxWidth: '1400px',
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            }}>
                <Grid container spacing={3} sx={{ mb: 4, alignItems: 'center' }}>
                    <Grid item xs={12} md={6}>
                        <ToggleButtonGroup
                            value={activeSection}
                            exclusive
                            onChange={handleSectionChange}
                            aria-label="sections"
                            sx={{
                                width: '100%',
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 1,
                                '& .MuiToggleButtonGroup-grouped': {
                                    border: '1px solid rgba(255,255,255,0.2) !important',
                                    borderRadius: '8px !important',
                                    margin: '0 !important',
                                    color: '#ccc',
                                    fontFamily: 'sinkin_sans200_x_light',
                                    textTransform: 'none',
                                    padding: '8px 16px',
                                    flex: 1,
                                    minWidth: '200px',
                                    display: 'flex',
                                    gap: '8px',
                                    '&.Mui-selected': {
                                        color: '#fff',
                                        backgroundColor: 'rgba(166, 206, 62, 0.2)',
                                        borderColor: '#A6CE3E !important',
                                    },
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                    }
                                }
                            }}
                        >
                            {sections.map((sec) => (
                                <ToggleButton key={sec.value} value={sec.value} sx={{
                                    '&.Mui-selected': {
                                        backgroundColor: `${sec.color}33 !important`,
                                        borderColor: `${sec.color} !important`
                                    }
                                }}>
                                    {React.cloneElement(sec.icon as React.ReactElement, { sx: { color: activeSection === sec.value ? sec.color : '#ccc' } })}
                                    <span>{sec.label}</span>
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Grid>

                    <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={handleViewChange}
                            aria-label="view mode"
                            sx={{
                                '& .MuiToggleButtonGroup-grouped': {
                                    border: '1px solid rgba(255,255,255,0.2) !important',
                                    color: '#ccc',
                                    padding: '8px',
                                    '&.Mui-selected': {
                                        color: '#fff',
                                        backgroundColor: 'rgba(166, 206, 62, 0.2)',
                                        borderColor: '#A6CE3E !important',
                                    },
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                    }
                                },
                                '& .MuiToggleButtonGroup-grouped:first-of-type': {
                                    borderRadius: '8px 0 0 8px !important',
                                },
                                '& .MuiToggleButtonGroup-grouped:last-of-type': {
                                    borderRadius: '0 8px 8px 0 !important',
                                }
                            }}
                        >
                            <ToggleButton value="list" aria-label="list view">
                                <ViewListIcon />
                            </ToggleButton>
                            <ToggleButton value="cards" aria-label="cards view">
                                <ViewModuleIcon />
                            </ToggleButton>
                        </ToggleButtonGroup>
                        <IconButton 
                            onClick={handleFilterClick}
                            sx={{ 
                                ml: 1, 
                                border: '1px solid rgba(255,255,255,0.2)', 
                                borderRadius: '8px',
                                color: (selectedDepartamentos.length > 0 || selectedCategorias.length > 0) ? '#fff' : '#ccc',
                                backgroundColor: (selectedDepartamentos.length > 0 || selectedCategorias.length > 0) ? 'rgba(166, 206, 62, 0.2)' : 'transparent',
                                borderColor: (selectedDepartamentos.length > 0 || selectedCategorias.length > 0) ? '#A6CE3E' : 'rgba(255,255,255,0.2)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                }
                            }}
                        >
                            <FilterListIcon />
                        </IconButton>
                    </Grid>

                    {/* Filter Menu */}
                    <Menu
                        anchorEl={filterAnchorEl}
                        open={Boolean(filterAnchorEl)}
                        onClose={handleFilterClose}
                        PaperProps={{
                            sx: {
                                mt: 1,
                                maxHeight: 400,
                                width: 250,
                                background: 'rgba(30, 30, 30, 0.95)',
                                backdropFilter: 'blur(10px)',
                                color: '#fff',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                fontFamily: 'sinkin_sans200_x_light',
                                '& .MuiMenuItem-root': {
                                    fontFamily: 'sinkin_sans200_x_light',
                                    fontSize: '14px',
                                },
                                '& .MuiListSubheader-root': {
                                    background: 'transparent',
                                    color: '#A6CE3E',
                                    fontFamily: 'sinkin_sans200_x_light',
                                    fontWeight: 700,
                                    lineHeight: '36px'
                                },
                                '&::-webkit-scrollbar': { width: '6px' },
                                '&::-webkit-scrollbar-thumb': { background: '#A6CE3E', borderRadius: '3px' }
                            }
                        }}
                    >
                        <ListSubheader>Ordenar</ListSubheader>
                        <MenuItem onClick={() => { setSortOrder('asc'); handleFilterClose(); }}>
                            <ArrowDownwardIcon sx={{ mr: 1, fontSize: 18 }} /> A - Z
                            {sortOrder === 'asc' && <span style={{ marginLeft: 'auto', color: '#A6CE3E' }}>✓</span>}
                        </MenuItem>
                        <MenuItem onClick={() => { setSortOrder('desc'); handleFilterClose(); }}>
                            <ArrowUpwardIcon sx={{ mr: 1, fontSize: 18 }} /> Z - A
                            {sortOrder === 'desc' && <span style={{ marginLeft: 'auto', color: '#A6CE3E' }}>✓</span>}
                        </MenuItem>
                        
                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1 }} />
                        
                        <ListSubheader>Departamento</ListSubheader>
                        {DEPARTAMENTOS.map((depto) => (
                            <MenuItem key={depto} onClick={() => handleDeptoToggle(depto)} sx={{ py: 0 }}>
                                <Checkbox 
                                    checked={selectedDepartamentos.includes(depto)} 
                                    sx={{ color: 'rgba(255,255,255,0.5)', '&.Mui-checked': { color: '#A6CE3E' }, padding: '4px 8px 4px 0' }}
                                />
                                <ListItemText primary={depto} primaryTypographyProps={{ fontFamily: 'sinkin_sans200_x_light', fontSize: '13px' }}/>
                            </MenuItem>
                        ))}

                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1 }} />
                        
                        <ListSubheader>Categoría</ListSubheader>
                        {CATEGORIAS.map((cat) => (
                            <MenuItem key={cat} onClick={() => handleCategoriaToggle(cat)} sx={{ py: 0 }}>
                                <Checkbox 
                                    checked={selectedCategorias.includes(cat)} 
                                    sx={{ color: 'rgba(255,255,255,0.5)', '&.Mui-checked': { color: '#A6CE3E' }, padding: '4px 8px 4px 0' }}
                                />
                                <ListItemText primary={`Categoría ${cat}`} primaryTypographyProps={{ fontFamily: 'sinkin_sans200_x_light', fontSize: '13px' }}/>
                            </MenuItem>
                        ))}
                    </Menu>

                    <Grid item xs={12} md={4}>
                        <Autocomplete
                            options={data}
                            getOptionLabel={(option) => `${option.eta} (${option.depto})`}
                            value={selectedEta}
                            onChange={(e, val) => {
                                setSelectedEta(val);
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Buscador por Departamento y Municipio" variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            color: '#fff',
                                            fontFamily: 'sinkin_sans200_x_light',
                                            background: 'rgba(0,0,0,0.2)',
                                            borderRadius: '8px',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                            '&:hover fieldset': { borderColor: '#A6CE3E' },
                                            '&.Mui-focused fieldset': { borderColor: '#A6CE3E' },
                                        },
                                        '& .MuiInputLabel-root': { color: '#ccc', fontFamily: 'sinkin_sans200_x_light' },
                                        '& .MuiInputLabel-root.Mui-focused': { color: '#A6CE3E' }
                                    }}
                                />
                            )}
                        />
                    </Grid>
                </Grid>

                {/* Listado */}
                <Box sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    pr: 1,
                    '&::-webkit-scrollbar': { width: '8px' },
                    '&::-webkit-scrollbar-thumb': { background: '#A6CE3E', borderRadius: '4px' }
                }}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" py={10}>
                            <CircularProgress sx={{ color: '#A6CE3E' }} />
                        </Box>
                    ) : (
                        viewMode === 'cards' ? (
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
                                                borderColor: '#A6CE3E',
                                                boxShadow: '0 8px 24px rgba(166, 206, 62, 0.2)'
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
                                                    <p style={{ margin: '4px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <strong>Ficha:</strong> <span style={{ color: sections.find(s => s.value === activeSection)?.color }}>{activeSection}</span>
                                                    </p>
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
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {filteredData.map((item, idx) => (
                                    <Box key={item.id || idx} sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        padding: '16px 24px',
                                        backdropFilter: 'blur(4px)',
                                        color: '#fff',
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            borderColor: '#A6CE3E',
                                            backgroundColor: 'rgba(166, 206, 62, 0.05)',
                                        }
                                    }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                            <Typography variant="h6" sx={{ fontFamily: 'sinkin_sans200_x_light', fontWeight: 700 }}>
                                                {item.eta}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#A6CE3E', fontFamily: 'sinkin_sans200_x_light' }}>
                                                {item.tipo} | {item.depto}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'right', fontSize: '12px', color: '#ccc', fontFamily: 'sinkin_sans100_thin' }}>
                                            <p style={{ margin: '2px 0' }}>Cód. INE: {item.codINE || 'N/A'}</p>
                                            <p style={{ margin: '2px 0', color: sections.find(s => s.value === activeSection)?.color }}>{activeSection}</p>
                                        </Box>
                                    </Box>
                                ))}
                                {filteredData.length === 0 && (
                                    <Box width="100%" textAlign="center" py={6}>
                                        <Typography sx={{ fontFamily: 'sinkin_sans200_x_light', color: '#aaa' }}>
                                            No se encontraron resultados.
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )
                    )}
                </Box>
            </Box>
        </Box>
    );
}
