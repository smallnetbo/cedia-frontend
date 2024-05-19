import React from 'react';
import {
    ItemsType,
  } from './types/cargaDatosType' 
interface Props {
  datos: ItemsType[];
}

const TablaDinamica: React.FC<Props> = ({ datos }) => {
  return (
    <table>
      <thead>
        <tr>
          {Object.keys(datos[0]).map((columna) => (
            <th key={columna}>{columna}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {datos.map((fila) => (
          <tr key={fila.id}>
            {Object.values(fila).map((valor) => (
              <td key={valor}>{valor}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TablaDinamica;
