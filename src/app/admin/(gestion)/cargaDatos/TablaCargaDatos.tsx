import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'

interface DynamicTableProps {
  columnas: string[]
  datos: Record<string, any>[]
}

const TablaCargaDatos: React.FC<DynamicTableProps> = ({ columnas, datos }) => {
  return (
    <TableContainer
      component={Paper}
      sx={{
        mt: 3,
        boxShadow: 3,
        borderRadius: 2,
        maxHeight: 320,
        overflow: 'auto',
      }}
    >
      <Table size="small" sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            {columnas.map((columna) => (
              <TableCell
                key={columna}
                sx={{ fontWeight: 'bold', bgcolor: 'primary.light' }}
              >
                {columna}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {datos.map((fila, index) => (
            <TableRow
              key={index}
              sx={{ '&:nth-of-type(even)': { bgcolor: 'grey.100' } }}
            >
              {Object.keys(fila).map((columna) => (
                <TableCell key={columna}>{fila[columna]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default TablaCargaDatos
