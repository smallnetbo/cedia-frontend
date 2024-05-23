'use client'
import React, { useState, useEffect } from 'react';
import { delay, InterpreteMensajes, siteName, titleCase } from '@/utils'
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import FormCargaDatosView from './FormCargaDatosView'

import { AlertDialog } from '@/components/modales/AlertDialog'
import Button from '@mui/material/Button'
import { Constantes } from '@/config/Constantes'
import { useAlerts, useSession } from '@/hooks'

export default function GestionCargaDatosPage() {
  const [value, setValue] = React.useState('1');
  const [showAlert, setShowAlert] = useState(false); // Estado para mostrar la alerta
  const [mensajeAlert, setMensajeAlert] = useState(''); // Estado para mostrar la alerta
  const { sesionPeticion } = useSession()

  const handleChange = async (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue)
    
  }

  return (
    <>
    <title>{`Carga Datos - ${siteName()}`}</title>
    <div>
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Datos" value="1" />
            {/* <Tab label="Configuración" value="2" /> */}
            <Tab label="Finalizar" value="3" />
          
          </TabList>
        </Box>
        <TabPanel value="1"><FormCargaDatosView/></TabPanel>
        <TabPanel value="2">TAB 2</TabPanel>
        <TabPanel value="3">Finalizar</TabPanel>
        
      </TabContext>
    </Box>
    
    </div>
    </>
  );
}
