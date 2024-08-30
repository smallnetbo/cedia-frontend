import React from 'react'
import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { Icon } from '@mui/material'
import DynamicIcon from '@/components/IconRenderer/IconAutocomplete'

interface DynamicTableProps {
  data: {
    name: string
    data: ChartData[]
  }[]
  title?: string
  subTitle?: string
}

const DynamicTable: React.FC<DynamicTableProps> = ({
  data,
  title,
  subTitle,
}) => {
  return (
    <Paper elevation={4} style={{ height: '100%', padding: '16px' }}>
      <Box style={{ textAlign: 'center', marginBottom: '16px' }}>
        {title && (
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        )}
        {subTitle && (
          <Typography variant="subtitle1" color="textSecondary">
            {subTitle}
          </Typography>
        )}
      </Box>

      <TableContainer style={{ maxHeight: 'calc(100% - 64px)' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: '#f0f0f0' }}>Nombre</TableCell>
              {data[0].data.map((item, index) => (
                <TableCell key={index} sx={{ backgroundColor: '#f0f0f0' }}>
                  {item.nombre}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                {row.data.map((item, idx) => (
                  <TableCell
                    key={idx}
                    style={{
                      color: item.color,
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      {item.icono && <DynamicIcon iconName={item.icono} />}
                      {item.valor}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}

export default DynamicTable
