const { Constantes } = require('./src/config/Constantes.ts');
// since it's typescript we can just use fetch on the API url
async function test() {
  const rs = await fetch('http://localhost:3000/api/entidad/nivelGobierno?nivelGobierno=GAM');
  const json = await rs.json();
  const datos = json.datos;
  let conCoords = datos.filter(d => d.coordenadasGeograficas && d.coordenadasGeograficas.length > 0);
  console.log("Total GAM:", datos.length, "Con Coordenadas:", conCoords.length);
}
test();
