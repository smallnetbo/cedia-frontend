import React, { useState } from 'react'
import Grid from '@mui/material/Grid'
import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Paper,
  styled,
  Switch,
  Typography,
} from '@mui/material'
import dynamic from 'next/dynamic'
import { Gobiernos, NivelGobierno } from '@/types/map/entidad.interface'

const MapGeoreferencia = dynamic(
  () => import('@/components/map/mapaGeoreferencia'),
  {
    loading: () => (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 650,
        }}
      >
        <CircularProgress />
      </Box>
    ),
    ssr: false,
  }
)

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}))

interface InformacionInterface {
  infoGeoreferenciaData: NivelGobierno[]
  selectedGobierno: Gobiernos
}

const GeoreferenciaComponent = ({
  infoGeoreferenciaData,
  selectedGobierno,
}: InformacionInterface) => {
  const [switchStates, setSwitchStates] = useState<{ [key: string]: boolean }>(
    {}
  )
  const [selectedEntidades, setSelectedEntidades] = useState<number[]>([])

  const [modalPdf, setModalPdf] = useState(false)
  const verPdfModal = async () => {
    setModalPdf(true)
  }
  const toggleSwitch = (itemName: string, entityId: string) => {
    const newSwitchStates = { ...switchStates }
    newSwitchStates[itemName] = !newSwitchStates[itemName]
    const activeCount = Object.values(newSwitchStates).filter(Boolean).length

    const variable = data.find((item) =>
      item.variables.find((subItem) => subItem.id === itemName)
    )
    if (variable) {
      const entity = variable.variables.find(
        (subItem) => subItem.id === itemName
      )
      if (entity) {
        const entityCode = entity.entidadVariables.map(
          (entidad) => entidad.entidad.codigoEntidad
        )
        const entidadNumber = parseInt(entityCode[0], 10)
        if (newSwitchStates[itemName]) {
          if (activeCount <= 4) {
            setSelectedEntidades((prevState) => [...prevState, entidadNumber])
          }
        } else {
          setSelectedEntidades((prevState) =>
            prevState.filter((id) => id !== entidadNumber)
          )
        }
      }
    }
    setSwitchStates(newSwitchStates)
  }

  const activeSwitchesCount = Object.values(switchStates).filter(
    (state) => state
  ).length

  const data = [
    {
      id: '10',
      nombre: 'Recursos',
      icono: 'emoji_people',
      tipoDatoGeneral: null,
      variables: [
        {
          id: '15',
          nombre: 'Recaudación trib. 10 mil-10 mill Bs',
          nombreCorto: 're',
          posicion: null,
          items: [
            {
              id: '30',
              nombre: 'Hombre',
              color: '#0bc9b1',
              icono: 'man_2',
              esAgrupador: false,
            },
            {
              id: '31',
              nombre: 'Mujer',
              color: '#09ad99',
              icono: 'woman_2',
              esAgrupador: false,
            },
          ],
          graficos: {
            id: '9',
            titulo: 'Niñez',
            ancho: '50',
            tipoGrafico: {
              id: '1',
              descripcion: 'bar',
            },
          },
          entidadVariables: [
            {
              id: '306',
              datoRegistro: {
                mujer: 14944,
                hombre: 15547,
              },
              entidad: {
                id: '10',
                nombre: 'Aiquile',
                codigoEntidad: '1307',
              },
            },
          ],
        },
      ],
    },
  ]

  return (
    <>
      <Grid container alignItems="center">
        <Grid item xs={6} md={6}>
          <Typography variant={'body1'}>
            Seleccione hasta 2 variables para su visualización
          </Typography>
        </Grid>
        <Grid item xs={6} md={6} style={{ textAlign: 'right' }}>
          <Button
            disabled
            onClick={verPdfModal}
            startIcon={
              <span className="material-icons" style={{ fontSize: '34px' }}>
                local_printshop
              </span>
            }
          ></Button>
        </Grid>
      </Grid>
      <Grid container spacing={2} style={{ height: '100%' }}>
        <Grid
          item
          xs={12}
          md={12}
          lg={4}
          xl={3}
          sx={{ maxHeight: 650, overflow: 'auto' }}
        >
          <Item elevation={4} style={{ maxWidth: '100%', maxHeight: '650px' }}>
            {data.map((item) => (
              <Grid key={item.id}>
                <Typography
                  variant="h6"
                  style={{
                    backgroundColor: '#50C0B2',
                    padding: '8px',
                    color: 'white',
                    textAlign: 'center',
                    width: '100%',
                  }}
                >
                  {item.nombre}
                </Typography>
                {item.variables.map((subItem) => (
                  <Grid container alignItems="center" key={subItem.id}>
                    <Grid item xs={6}>
                      <Typography variant="caption">
                        {subItem.nombre}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} style={{ textAlign: 'right' }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={switchStates[subItem.id] || false}
                            onChange={() =>
                              toggleSwitch(subItem.id, subItem.id)
                            }
                            disabled={
                              activeSwitchesCount >= 2 &&
                              !switchStates[subItem.id]
                            }
                          />
                        }
                        label=""
                      />
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            ))}
          </Item>
        </Grid>

        <Grid item xs={12} md={12} lg={8} xl={9}>
          <Paper
            elevation={15}
            sx={{
              borderRadius: '15px',
              position: 'relative',
              height: '450px',
              zIndex: 0,
              '@media (min-width: 600px)': {
                height: '600px',
              },
            }}
          >
            <MapGeoreferencia
              typeVisualize={selectedGobierno.id}
              selectedEntidades={selectedEntidades}
            />
          </Paper>
        </Grid>
      </Grid>
    </>
  )
}

export default GeoreferenciaComponent
