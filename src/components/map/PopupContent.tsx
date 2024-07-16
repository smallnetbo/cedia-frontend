import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'
import {
  Box,
  Icon,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'

const TooltipContent = ({
  nombre,
  chartData,
  color,
}: {
  nombre: string
  chartData: ChartData[]
  color: string
}) => {
  return (
    <Box
      style={{
        backgroundColor: color,
        color: '#fff',
        padding: '5px',
        borderRadius: '8px',
      }}
    >
      <Typography
        variant="h2"
        style={{ marginBottom: '5px', textAlign: 'center' }}
      >
        {nombre}
      </Typography>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {chartData.map((data, index) => (
          <div key={index} style={{ margin: '5px', textAlign: 'center' }}>
            <Icon
              style={{
                color: data.color,
                fontSize: '24px',
                marginBottom: '5px',
              }}
            >
              {data.icono}
            </Icon>
            <Typography
              variant="body2"
              style={{ color: '#fff' }}
            >{`${data.nombre}: ${data.valor}`}</Typography>
          </div>
        ))}
      </div>
    </Box>
  )
}

export default TooltipContent
