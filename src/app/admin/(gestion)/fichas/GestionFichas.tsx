//import * as React from 'react';
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import FormFichasView from './FormFichaView'
import SubSectorView from './SubSectoresView'
import VariablesView from './VariablesView'
import ItemsView from './ItemsView'
import { AlertDialog } from '@/components/modales/AlertDialog'
import Button from '@mui/material/Button'

export default function GestionFichasPage() {
  const [value, setValue] = React.useState('1');
  const [showAlert, setShowAlert] = useState(false); // Estado para mostrar la alerta

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    //setValue(newValue);
    // if (initialFicha) {
    //   setValue(newValue) // Cambia al nuevo panel
    // } else {
    //   setShowAlert(true) // Muestra la alerta
      
    // }
  const storedData = localStorage?.getItem('fichaStorage');
  const initialFicha = storedData ? JSON.parse(storedData) : null;
    switch (newValue) {
      case '1':
        setValue(newValue)
        break;
      case '2': 
          initialFicha? setValue(newValue): setShowAlert(true)
        break;
      case '3':
        // Lógica para el panel 3
        console.log('Panel 3 seleccionado');
        break;
      case '4':
        // Lógica para el panel 4
        console.log('Panel 4 seleccionado');
        break;
      default:
        // Lógica para el caso por defecto (si es necesario)
        break;
    }
  }



const aceptarAlerta = async () => {
  setShowAlert(false) 
 
}

  return (
    <div>
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Ficha" value="1" />
            <Tab label="Sub Sectores" value="2" />
            <Tab label="Variables" value="3" />
            <Tab label="Items" value="4" />
          </TabList>
        </Box>
        <TabPanel value="1"><FormFichasView/> </TabPanel>
        <TabPanel value="2"><SubSectorView/></TabPanel>
        <TabPanel value="3"><VariablesView/></TabPanel>
        <TabPanel value="4"><ItemsView/></TabPanel>
      </TabContext>
    </Box>
    
      
    {/* Resto de tu código */}
    <AlertDialog
        isOpen={showAlert}
        titulo={'Alerta'}
        texto={'Tine que cargar una ficha'}
      >
        
        <Button variant={'contained'} onClick={aceptarAlerta}>
          Aceptar
        </Button>
      </AlertDialog>

    </div>
  );
}
