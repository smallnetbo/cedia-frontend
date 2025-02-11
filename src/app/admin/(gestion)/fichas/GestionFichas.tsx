/* eslint-disable require-await */
import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import FormFichasView from './FormFichaView'
import SubSectorView from './SubSectoresView'
import VariablesView from './VariablesView'
import ItemsView from './ItemsView'
import { AlertDialog } from '@/components/modales/AlertDialog'
import Button from '@mui/material/Button'
import { Constantes } from '@/config/Constantes'
import { useSession } from '@/hooks'

export default function GestionFichasPage() {
  const [value, setValue] = React.useState('1')
  const [showAlert, setShowAlert] = useState(false)
  const [mensajeAlert, setMensajeAlert] = useState('')
  const { sesionPeticion } = useSession()

  const handleChange = async (
    event: React.SyntheticEvent,
    newValue: string
  ) => {
    var result: any
    const storedData = localStorage?.getItem('fichaStorage')
    const initialFicha = storedData ? JSON.parse(storedData) : null
    if (initialFicha) {
      const resultado = await obtenerSubSectorVariablesItemsPeticion(
        initialFicha.id
      )

      result = resultado
    }
    switch (newValue) {
      case '1':
        setValue(newValue)
        break
      case '2':
        setMensajeAlert(
          'No hay Ficha para crear Sub sector, registre una nueva o seleccione un existente'
        )
        initialFicha ? setValue(newValue) : setShowAlert(true)
        break
      case '3':
        setMensajeAlert(
          'No hay Sub sector para crear Variables, registre un Sub Sector'
        )
        initialFicha
          ? result[0]
            ? setValue(newValue)
            : setShowAlert(true)
          : setShowAlert(true)

        break
      case '4':
        setMensajeAlert('No hay Variable para crear Item, registre Variable')
        initialFicha
          ? result[0]
            ? result[0].variables[0]
              ? setValue(newValue)
              : setShowAlert(true)
            : setShowAlert(true)
          : setShowAlert(true)

        break
      default:
        break
    }
  }

  const aceptarAlerta = async () => {
    setShowAlert(false)
  }

  const obtenerSubSectorVariablesItemsPeticion = async (idFicha: any) => {
    try {
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/subsector/variables/itemlist${
          idFicha ? `/${idFicha}` : '/0'
        }`,
      })

      return respuesta.datos
    } catch (e) {
      throw e
    } finally {
    }
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
          <TabPanel value="1">
            <FormFichasView />{' '}
          </TabPanel>
          <TabPanel value="2">
            <SubSectorView />
          </TabPanel>
          <TabPanel value="3">
            <VariablesView />
          </TabPanel>
          <TabPanel value="4">
            <ItemsView />
          </TabPanel>
        </TabContext>
      </Box>

      {/* Resto de tu código */}
      <AlertDialog isOpen={showAlert} titulo={'Alerta'} texto={mensajeAlert}>
        <Button variant={'contained'} onClick={aceptarAlerta}>
          Aceptar
        </Button>
      </AlertDialog>
    </div>
  )
}
