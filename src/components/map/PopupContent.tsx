import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'
import { Box, Typography } from '@mui/material'

const TooltipContent = ({
  nombre,
  chartData,
}: {
  nombre: string
  chartData: ChartData[]
}) => {
  return (
    <Box>
      <Typography variant="body2" style={{ margin: '0', textAlign: 'center' }}>
        {nombre}
      </Typography>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {chartData.map((data, index) => {
          const formattedValue =
            typeof data.valor === 'number'
              ? data.valor.toFixed(2)
              : !isNaN(parseFloat(data.valor))
                ? parseFloat(data.valor).toFixed(2)
                : data.valor

          return (
            <Typography
              key={index}
              variant="body2"
              style={{
                margin: '1px 0',
                textAlign: 'center',
              }}
            >
              {`${data.nombre}: ${formattedValue}`}
            </Typography>
          )
        })}
      </div>
    </Box>
  )
}

export default TooltipContent
