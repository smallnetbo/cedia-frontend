import { tipoGobierno } from '@/types/map/entidad.interface'
import { ObjetoEntidad } from '@/types/map/map.interface'
import React from 'react'

interface HoverCardInterface {
  type: tipoGobierno
  hoverPropertiesFeature: ObjetoEntidad
}

const HoverCard = ({ type, hoverPropertiesFeature }: HoverCardInterface) => {
  return (
    <div className="z-10 left-5 bg-opacity-80 bottom-5 absolute p-2 lg:p-4 bg-white flex flex-col items-center shadow-lg border rounded-xl">
      <div className="flex flex-col items-center gap-1 text-zinc-600">
        <div className="flex gap-2 items-end">
          <p className="text-xs 2xl:text-sm font-semibold text-zinc-500 ">
            {type === 'GAD' && <>GAD</>}
            {type === 'GAM' && <>GAM</>}
            {type === 'GAIOC' && <>GAIOC</>}
            {type === 'GAR' && <>GAR</>}
          </p>
          {type === 'GAD' ? (
            <>{hoverPropertiesFeature?.nom_dpto}</>
          ) : (
            <p className="text-xs 2xl:text-sm">
              {hoverPropertiesFeature?.municipio}
            </p>
          )}
        </div>
        {(type === 'GAM' || type === 'GAIOC' || type === 'GAR') && (
          <div className="flex flex-col gap-2 text-xs 2xl:text-sm items-center">
            <p>DEPARTAMENTO: {hoverPropertiesFeature?.nom_dpto}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default HoverCard
