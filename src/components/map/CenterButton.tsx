import { Button } from '@mui/material'
import React from 'react'
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap'

const ReloadButton = ({ onClick }) => {
  return (
    <Button
      variant="outlined"
      size="small"
      sx={{
        zIndex: 400,
        position: 'absolute',
        top: 73,
        left: 10,
        padding: 0,
        minWidth: 'auto',
        width: '35px',
        height: '33px',
        borderColor: 'black',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        '&:hover': {
          backgroundColor: '#f0f0f0',
        },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => {
        e.preventDefault()
        onClick()
      }}
    >
      <ZoomOutMapIcon style={{ fontSize: '20px', color: '#000' }} />
    </Button>
  )
}

export default ReloadButton
