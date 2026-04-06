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
    ListSubheader,
    Tooltip
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
    const [visorUrl, setVisorUrl] = useState<string | null>(null);
    const [visorData, setVisorData] = useState<{ item: EtaData, section: string } | null>(null);
    const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);
    const [hasEmbedParam, setHasEmbedParam] = useState<boolean>(false);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.has('embed') || searchParams.has('iframe')) {
                setHasEmbedParam(true);
            }
        }
    }, []);

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
        let matchSearch = true;
        if (selectedEta) {
            matchSearch = item.id === selectedEta.id;
        } else if (searchText) {
            const searchLower = searchText.toLowerCase();
            matchSearch = item.eta.toLowerCase().includes(searchLower) ||
                item.depto.toLowerCase().includes(searchLower);
        }
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

    const handleItemClick = (item: EtaData) => {
        let pdfUrl = `https://elecciones2021.sea.gob.bo/docs/fichas/${item.id}.pdf`;
        let tipo = 'fiscal';

        if (activeSection === 'Estadísticas en Materia de Género') {
            pdfUrl = `https://elecciones2021.sea.gob.bo/docs/fichasGenero/${item.id}Genero.pdf`;
            tipo = 'genero';
        } else if (activeSection === 'Derechos Sexuales y Reproductivos') {
            pdfUrl = `https://elecciones2021.sea.gob.bo/docs/fichasDerechos/${item.id}.pdf`;
            tipo = 'derechos';
        }

        const timestamp = new Date().getTime();
        setIframeLoaded(false);

        if (hasEmbedParam) {
            setVisorUrl(`https://app.sea.gob.bo/app/fichas/visor.php?eta=${item.id}&tipo=${tipo}&t=${timestamp}`);
        } else {
            setVisorUrl(`${pdfUrl}?t=${timestamp}`);
        }

        setVisorData({ item, section: activeSection });
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
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'flex-start',
            zIndex: 100000,
            padding: { xs: '20px 15px 15px 15px', md: '120px 40px 40px 40px' },
            transition: 'opacity 0.5s',
            animation: 'growAndAppear 0.9s cubic-bezier(0.7,0,0.3,1) forwards',
            color: '#fff',
            overflow: 'hidden',
            //background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: { xs: 'blur(10px)', md: 'none' },
        }}>
            <IconButton
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    top: { xs: 15, md: 80 },
                    right: { xs: 15, md: 40 },
                    color: '#A6CE3E',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    '&:hover': { background: 'rgba(255, 255, 255, 0.15)' },
                    zIndex: 10,
                    padding: { xs: '6px', md: '8px' }
                }}
            >
                <CloseOutlinedIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
            </IconButton>

            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: '10px', md: '15px' },
                marginBottom: { xs: '15px', md: '30px' },
                marginTop: { xs: '5px', md: 0 },
                maxWidth: { xs: 'calc(100% - 40px)', md: '100%' }
            }}>
                <AssessmentOutlinedIcon sx={{ fontSize: { xs: 24, md: 40 }, color: '#A6CE3E' }} />
                <Typography variant="h4" sx={{
                    fontFamily: 'sinkin_sans200_x_light',
                    fontWeight: 700,
                    letterSpacing: { xs: 0.5, md: 1.5 },
                    color: '#fff',
                    fontSize: { xs: '1.25rem', md: '2.125rem' }
                }}>
                    Fichas Municipales
                </Typography>
            </Box>

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
                padding: { xs: '15px', md: '24px' },
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            }}>
                <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 2, md: 4 }, alignItems: 'center' }}>
                    <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
                        <TextField
                            select
                            value={activeSection}
                            onChange={(e) => setActiveSection(e.target.value)}
                            variant="outlined"
                            sx={{
                                display: { xs: 'flex', md: 'none' },
                                width: '100%',
                                '& .MuiOutlinedInput-root': {
                                    color: '#fff',
                                    fontFamily: 'sinkin_sans200_x_light',
                                    background: 'rgba(0,0,0,0.2)',
                                    borderRadius: '8px',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                    '&:hover fieldset': { borderColor: '#A6CE3E' },
                                    '&.Mui-focused fieldset': { borderColor: '#A6CE3E' },
                                },
                                '& .MuiSelect-select': {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    padding: '10px 14px'
                                },
                                '& .MuiSelect-icon': {
                                    color: '#A6CE3E'
                                }
                            }}
                            SelectProps={{
                                MenuProps: {
                                    PaperProps: {
                                        sx: {
                                            background: 'rgba(30, 30, 30, 0.95)',
                                            color: '#fff',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            '& .MuiMenuItem-root': {
                                                fontFamily: 'sinkin_sans200_x_light',
                                            },
                                            '& .MuiMenuItem-root:hover': {
                                                backgroundColor: 'rgba(255,255,255,0.1)'
                                            },
                                            '& .Mui-selected': {
                                                backgroundColor: 'rgba(166, 206, 62, 0.2) !important'
                                            }
                                        }
                                    }
                                }
                            }}
                        >
                            {sections.map((sec) => (
                                <MenuItem key={sec.value} value={sec.value} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    {React.cloneElement(sec.icon as React.ReactElement, { sx: { color: sec.color, fontSize: 18 } })}
                                    <Typography variant="body2" sx={{ fontFamily: 'sinkin_sans200_x_light', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sec.label}</Typography>
                                </MenuItem>
                            ))}
                        </TextField>

                        <ToggleButtonGroup
                            value={activeSection}
                            exclusive
                            onChange={handleSectionChange}
                            aria-label="sections"
                            sx={{
                                width: '100%',
                                display: { xs: 'none', md: 'flex' },
                                flexWrap: { xs: 'nowrap', md: 'wrap' },
                                overflowX: { xs: 'auto', md: 'visible' },
                                gap: 1,
                                paddingBottom: { xs: '8px', md: '0' },
                                '&::-webkit-scrollbar': { height: '6px' },
                                '&::-webkit-scrollbar-thumb': { background: '#A6CE3E', borderRadius: '3px' },
                                '& .MuiToggleButtonGroup-grouped': {
                                    border: '1px solid rgba(255,255,255,0.2) !important',
                                    borderRadius: '8px !important',
                                    margin: '0 !important',
                                    color: '#ccc',
                                    fontFamily: 'sinkin_sans200_x_light',
                                    textTransform: 'none',
                                    padding: { xs: '6px 12px', md: '8px 16px' },
                                    flex: { xs: '0 0 auto', md: 1 },
                                    minWidth: { xs: '180px', md: '200px' },
                                    display: 'flex',
                                    gap: '8px',
                                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                    }
                                }
                            }}
                        >
                            {sections.map((sec) => (
                                <ToggleButton key={sec.value} value={sec.value} sx={{
                                    '&.Mui-selected': {
                                        backgroundColor: `${sec.color} !important`,
                                        borderColor: `${sec.color} !important`,
                                        color: '#fff !important',
                                        fontWeight: 600,
                                        boxShadow: `0 4px 12px ${sec.color}66`
                                    }
                                }}>
                                    {React.cloneElement(sec.icon as React.ReactElement, { sx: { color: activeSection === sec.value ? '#fff' : '#ccc', fontSize: { xs: 18, md: 24 }, filter: activeSection === sec.value ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' : 'none' } })}
                                    <span style={{ textShadow: activeSection === sec.value ? '0 1px 2px rgba(0,0,0,0.4)' : 'none' }}>{sec.label}</span>
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Grid>

                    <Grid item xs={12} md={2} order={{ xs: 3, md: 2 }} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'center' } }}>
                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={handleViewChange}
                            aria-label="view mode"
                            sx={{
                                '& .MuiToggleButtonGroup-grouped': {
                                    border: '1px solid rgba(255,255,255,0.2) !important',
                                    color: '#ccc',
                                    padding: { xs: '6px 12px', md: '8px' },
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
                                <ViewListIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
                            </ToggleButton>
                            <ToggleButton value="cards" aria-label="cards view">
                                <ViewModuleIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
                            </ToggleButton>
                        </ToggleButtonGroup>
                        <IconButton
                            onClick={handleFilterClick}
                            sx={{
                                ml: { xs: 2, md: 1 },
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                color: (selectedDepartamentos.length > 0 || selectedCategorias.length > 0) ? '#fff' : '#ccc',
                                backgroundColor: (selectedDepartamentos.length > 0 || selectedCategorias.length > 0) ? 'rgba(166, 206, 62, 0.2)' : 'transparent',
                                borderColor: (selectedDepartamentos.length > 0 || selectedCategorias.length > 0) ? '#A6CE3E' : 'rgba(255,255,255,0.2)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                },
                                padding: { xs: '6px 12px', md: '8px' }
                            }}
                        >
                            <FilterListIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
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
                                <ListItemText primary={depto} primaryTypographyProps={{ fontFamily: 'sinkin_sans200_x_light', fontSize: '13px' }} />
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
                                <ListItemText primary={`Categoría ${cat}`} primaryTypographyProps={{ fontFamily: 'sinkin_sans200_x_light', fontSize: '13px' }} />
                            </MenuItem>
                        ))}
                    </Menu>

                    <Grid item xs={12} md={4} order={{ xs: 1, md: 3 }}>
                        <Autocomplete
                            options={data}
                            getOptionLabel={(option) => `${option.eta} (${option.depto})`}
                            value={selectedEta}
                            onChange={(e, val) => {
                                setSelectedEta(val);
                            }}
                            inputValue={searchText}
                            onInputChange={(event, newInputValue, reason) => {
                                setSearchText(newInputValue);
                                if (reason === 'input' || reason === 'clear') {
                                    setSelectedEta(null);
                                }
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
                                        <Card
                                            onClick={() => handleItemClick(item)}
                                            sx={{
                                                position: 'relative',
                                                overflow: 'hidden',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '12px',
                                                backdropFilter: 'blur(4px)',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    borderColor: '#A6CE3E',
                                                    boxShadow: '0 8px 24px rgba(166, 206, 62, 0.2)',
                                                    '& .hover-bg-image': {
                                                        opacity: 0.85
                                                    }
                                                }
                                            }}>
                                            <Box
                                                className="hover-bg-image"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    width: '65%',
                                                    backgroundImage: `url(/api/foto-municipio?id=${item.id})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    opacity: 0,
                                                    transition: 'opacity 0.4s ease-in-out',
                                                    maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 80%)',
                                                    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 80%)',
                                                    zIndex: 0
                                                }}
                                            />
                                            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                                                <Typography variant="caption" sx={{ color: '#A6CE3E', fontFamily: 'sinkin_sans200_x_light', fontWeight: 700 }}>
                                                    {/* {item.tipo} | {item.depto} */}
                                                    {item.depto}
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontFamily: 'sinkin_sans200_x_light', fontWeight: 700, mt: 1, mb: 1, minHeight: '64px' }}>
                                                    {item.eta}
                                                </Typography>
                                                <Box sx={{ fontSize: '12px', color: '#ccc', fontFamily: 'sinkin_sans100_thin' }}>
                                                    <p style={{ margin: '4px 0' }}><strong>Código:</strong> {item.id || 'N/A'}</p>
                                                    <Box sx={{ margin: '8px 0 0 0', display: 'flex', justifyContent: 'right', alignItems: 'center', gap: '6px' }}>

                                                        <span style={{
                                                            backgroundColor: sections.find(s => s.value === activeSection)?.color,
                                                            color: '#fff',
                                                            alignItems: 'center',
                                                            padding: '3px 8px',
                                                            borderRadius: '6px',
                                                            fontFamily: 'sinkin_sans200_x_light',
                                                            fontWeight: 600,
                                                            letterSpacing: '0.5px',
                                                            textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                        }}>
                                                            Ver Ficha
                                                        </span>
                                                    </Box>
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
                                    <Box key={item.id || idx}
                                        onClick={() => handleItemClick(item)}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '12px',
                                            padding: '16px 24px',
                                            backdropFilter: 'blur(4px)',
                                            color: '#fff',
                                            cursor: 'pointer',
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
                                                {item.depto}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'right', fontSize: '12px', color: '#ccc', fontFamily: 'sinkin_sans100_thin' }}>
                                            <p style={{ margin: '2px 0' }}>Código: {item.id || 'N/A'}</p>
                                            <Box sx={{ margin: '6px 0 0 0', display: 'flex', justifyContent: 'flex-end' }}>
                                                <span style={{
                                                    backgroundColor: sections.find(s => s.value === activeSection)?.color,
                                                    color: '#fff',
                                                    padding: '3px 8px',
                                                    borderRadius: '6px',
                                                    fontFamily: 'sinkin_sans200_x_light',
                                                    fontWeight: 600,
                                                    letterSpacing: '0.5px',
                                                    textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                }}>
                                                    {activeSection}
                                                </span>
                                            </Box>
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
            {visorUrl && (
                <Box sx={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 100001,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'growAndAppear 0.3s forwards'
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: { xs: 1, md: 3 } }}>
                        {visorData ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', color: '#fff', ml: 1 }}>
                                <Typography variant="h5" sx={{ fontFamily: 'sinkin_sans200_x_light', fontWeight: 700, color: '#A6CE3E', fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
                                    {visorData.item.eta}
                                </Typography>
                                <Box sx={{ mt: 1 }}>
                                    <span style={{
                                        backgroundColor: sections.find(s => s.value === visorData.section)?.color,
                                        color: '#fff',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        fontFamily: 'sinkin_sans200_x_light',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}>
                                        Ficha: {visorData.section}
                                    </span>
                                </Box>
                            </Box>
                        ) : <Box />}
                        <IconButton onClick={() => { setVisorUrl(null); setVisorData(null); }} sx={{ color: '#A6CE3E', background: 'rgba(255,255,255,0.1)', alignSelf: 'flex-start', '&:hover': { background: 'rgba(255,255,255,0.2)' } }}>
                            <CloseOutlinedIcon fontSize="large" />
                        </IconButton>
                    </Box>
                    <Box sx={{ flexGrow: 1, p: { xs: 1, md: 3 }, pt: 0, position: 'relative' }}>
                        {!iframeLoaded && (
                            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', zIndex: 1, gap: 2 }}>
                                <CircularProgress sx={{ color: '#A6CE3E' }} />
                                <Typography sx={{ color: '#fff', fontFamily: 'sinkin_sans200_x_light' }}>Cargando ficha...</Typography>
                            </Box>
                        )}
                        <iframe
                            key={visorUrl}
                            src={visorUrl}
                            onLoad={() => setIframeLoaded(true)}
                            style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px', backgroundColor: '#fff', position: 'relative', zIndex: iframeLoaded ? 2 : 0, opacity: iframeLoaded ? 1 : 0.01, transition: 'opacity 0.4s' }}
                            title="Visor"
                        />
                    </Box>
                </Box>
            )}
        </Box>
    );
}
