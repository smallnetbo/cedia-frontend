import React from 'react'
import { ListItem, ListItemText, ListItemIcon, Typography } from '@mui/material'
import { Icono } from '@/components/Icono'

interface VariableItemProps {
  item: {
    id: string
    nombre: string
    icono: string
    color: string
    datoRegistro?: {
      nombre: string
      valor: any
    }
  }
}

const VariableItem: React.FC<VariableItemProps> = ({ item }) => {
  return (
    <ListItem
      alignItems="flex-start"
      sx={{
        marginBottom: '1px',
        border: '1px solid #e0e0e0',
        borderRadius: '25px',
        padding: '3px',
      }}
    >
      <ListItemIcon sx={{ minWidth: '40px' }}>
        <Icono color={'inherit'} fontSize={'large'}>
          {item.icono}
        </Icono>
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography
            variant="body1"
            sx={{ fontSize: '1rem', fontWeight: 'bold' }}
          >
            {item.datoRegistro?.nombre}
          </Typography>
        }
        secondary={
          <Typography
            variant="body2"
            sx={{ fontSize: '0.9rem', color: '#616161' }}
          >
            {item.datoRegistro?.valor}
          </Typography>
        }
      />
    </ListItem>
  )
}

export default VariableItem
