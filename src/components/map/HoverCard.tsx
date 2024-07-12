import React from 'react'
import { Paper, Typography } from '@mui/material'

import { tipoGobierno } from '@/types/map/entidad.interface'
import { ObjetoEntidad } from '@/types/map/map.interface'

interface HoverCardInterface {
  type: tipoGobierno
  hoverPropertiesFeature: ObjetoEntidad
}
const HoverCard: React.FC<HoverCardInterface> = ({
  type,
  hoverPropertiesFeature,
}) => {
  return (
    <Paper
      elevation={3}
      style={{
        position: 'absolute',
        left: 5,
        bottom: 5,
        padding: '8px 16px',
        backgroundColor: 'white',
        borderRadius: '8px',
        zIndex: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <Typography
            variant="subtitle1"
            style={{ fontWeight: 'bold', color: '#374151' }}
          >
            {type === 'GAD' && <>GAD</>}
            {type === 'GAM' && <>GAM</>}
            {type === 'GAIOC' && <>GAIOC</>}
            {type === 'GAR' && <>GAR</>}
          </Typography>
          {type === 'GAD' ? (
            <Typography variant="subtitle1" style={{ color: '#374151' }}>
              {hoverPropertiesFeature?.nom_dpto}
            </Typography>
          ) : (
            <Typography variant="subtitle1" style={{ color: '#374151' }}>
              {hoverPropertiesFeature?.municipio}
            </Typography>
          )}
        </div>
        {(type === 'GAM' || type === 'GAIOC' || type === 'GAR') && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <Typography variant="subtitle1" style={{ color: '#374151' }}>
              DEPARTAMENTO: {hoverPropertiesFeature?.nom_dpto}
            </Typography>
          </div>
        )}
      </div>
    </Paper>
  )
}

export default HoverCard
