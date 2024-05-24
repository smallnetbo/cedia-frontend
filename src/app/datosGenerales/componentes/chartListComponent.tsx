import React, { useEffect, useRef } from 'react'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import ChartComponent from '@/components/echarts/chartComponent'
import { DatoRegistro } from '../types/datosGeneralesType'

interface ChartListComponentProps {
  charts: string[]
  chartData: {
    [key: string]: { name: string; data: { datoRegistro: DatoRegistro }[] }[]
  }
  selectedItem: string | null
  handleItemClick: (id: string) => void
  switchStates: { [key: string]: boolean }
  graficosPorVariable: { [variable: string]: string }
  entidad?: string
  paperRefs?: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>
}

const ChartListComponent = ({
  charts,
  chartData,
  selectedItem,
  handleItemClick,
  switchStates,
  graficosPorVariable,
  entidad,
  paperRefs,
}: ChartListComponentProps) => {
  return (
    <Grid container spacing={2}>
      {charts.map((item, index) => (
        <Grid
          item
          xs={12}
          sm={selectedItem === null ? 12 : 12}
          md={selectedItem === null ? 12 : 12}
          lg={selectedItem === null ? 6 : 12}
          xl={selectedItem === null ? 6 : 12}
          style={{
            display:
              selectedItem === item || selectedItem === null ? 'block' : 'none',
            minHeight: selectedItem === null ? '320px' : '640px',
          }}
          key={index}
        >
          <Paper
            // ref={(ref) => {
            //   // Asigna la referencia solo si el switch está activo
            //   if (switchStates[item]) {
            //     paperRefs.current[item] = ref
            //   }
            // }}
            style={{
              padding: '20px',
              textAlign: 'center',
              color: 'black',
              cursor: 'pointer',
              transform: selectedItem === item ? 'scale(1)' : 'scale(1)',
              transition: 'transform 0.3s ease-in-out',
              height: '100%',
            }}
            onClick={() => handleItemClick(item)}
          >
            {switchStates[item] && (
              <React.Fragment key={index}>
                {graficosPorVariable[item] && (
                  <ChartComponent
                    key={index}
                    type={graficosPorVariable[item]} // Tipo de gráfico
                    data={chartData[item]} // Datos del gráfico
                    title={entidad ? entidad : item} // Título del gráfico
                    subTitle="" // Subtítulo del gráfico
                  />
                )}
              </React.Fragment>
            )}

            {selectedItem === item && (
              <IconButton
                aria-label="close"
                style={{ position: 'absolute', right: '5px', top: '5px' }}
                onClick={() => handleItemClick(null)}
              >
                X
              </IconButton>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  )
}

export default ChartListComponent
