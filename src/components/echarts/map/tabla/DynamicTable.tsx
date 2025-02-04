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
  const isGrouped = data.length > 0 && data[0].data.length > 1

  const columnNames = Array.from(
    new Set(data.flatMap((serie) => serie.data.map((item) => item.nombre)))
  )

  return (
    <Paper elevation={4} sx={{ height: '100%', padding: '5px' }}>
      <Box sx={{ textAlign: 'center', marginBottom: '5px' }}>
        {title && (
          <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
            {title}
          </Typography>
        )}
        {subTitle && (
          <Typography
            variant="subtitle1"
            color="textSecondary"
            sx={{ fontSize: '0.9rem' }}
          >
            {subTitle}
          </Typography>
        )}
      </Box>

      <TableContainer sx={{ maxHeight: 'calc(100% - 64px)' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {isGrouped ? (
                <>
                  <TableCell
                    sx={{
                      backgroundColor: '#f0f0f0',
                      fontSize: '0.1rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Nombre
                  </TableCell>
                  {columnNames.map((name, index) => (
                    <TableCell
                      key={index}
                      sx={{
                        backgroundColor: '#f0f0f0',
                        fontSize: '0.1rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {name}
                    </TableCell>
                  ))}
                </>
              ) : (
                columnNames.map((name, index) => (
                  <TableCell
                    key={index}
                    sx={{
                      backgroundColor: '#f0f0f0',
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      lineHeight: '1.2',
                    }}
                  >
                    {name}
                  </TableCell>
                ))
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {isGrouped ? (
              data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{ fontSize: '0.8rem' }}
                  >
                    {row.name}
                  </TableCell>
                  {columnNames.map((colName, colIndex) => {
                    const item = row.data.find((d) => d.nombre === colName)
                    return (
                      <TableCell
                        key={colIndex}
                        sx={{
                          fontSize: '0.8rem',
                          color: item?.color,
                          lineHeight: '1.2',
                        }}
                      >
                        <Box display="flex" alignItems="center">
                          {item?.icono && <DynamicIcon iconName={item.icono} />}
                          {item?.valor}
                        </Box>
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                {columnNames.map((colName, colIndex) => {
                  const item = data
                    .flatMap((row) => row.data)
                    .find((item) => item.nombre === colName)

                  return (
                    <TableCell
                      key={colIndex}
                      sx={{
                        fontSize: '0.8rem',
                        color: item?.color,
                        lineHeight: '1.2',
                      }}
                    >
                      <Box display="flex" alignItems="center">
                        {item?.icono && <DynamicIcon iconName={item.icono} />}
                        {item?.valor}
                      </Box>
                    </TableCell>
                  )
                })}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}

export default DynamicTable
