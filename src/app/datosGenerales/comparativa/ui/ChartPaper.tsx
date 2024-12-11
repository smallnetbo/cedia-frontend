import React from 'react'
import { Grid, Paper, IconButton, Typography } from '@mui/material'
import { Fullscreen } from '@mui/icons-material'
import TipoGraficoComponent from '@/components/echarts/TipoGraficoComponent'
import { ChartData } from '../../types/datosGeneralesType'

interface ChartPaperComponentProps {
  chartName: string
  entidad: string
  chartData: {
    name: string
    data: ChartData[]
  }[]
  graficosPorVariable: { [variable: string]: string }
  onPaperClick: (chartName: string, entidad: string) => void
  onExport: (image: string) => void
}

const ChartPaperComponent: React.FC<ChartPaperComponentProps> = ({
  chartName,
  entidad,
  chartData,
  graficosPorVariable,
  onPaperClick,
  onExport,
}) => {
  return (
    <Grid
      item
      xs={12}
      sm={12}
      md={12}
      lg={6}
      xl={6}
      style={{ minHeight: '320px', display: 'block' }}
    >
      <Paper
        elevation={4}
        style={{
          textAlign: 'center',
          backgroundColor: 'white',
          transition: 'transform 0.3s ease-in-out',
          height: '100%',
          position: 'relative',
        }}
      >
        <IconButton
          aria-label="fullscreen"
          onClick={() => onPaperClick(chartName, entidad)}
          style={{ position: 'absolute', right: 8, top: 8, zIndex: 10 }}
        >
          <Fullscreen />
        </IconButton>
        {chartData.length > 0 ? (
          <TipoGraficoComponent
            type={graficosPorVariable[chartName]}
            data={chartData}
            title={`${entidad}`}
            subTitle=""
            onExport={onExport}
          />
        ) : (
          <Typography variant="h6">Gráfico Placeholder</Typography>
        )}
      </Paper>
    </Grid>
  )
}

export default ChartPaperComponent
