const fs = require('fs');
const completas = JSON.parse(fs.readFileSync('./src/components/map/api/CoordenadasCompletas.json'));
const multipoligono = JSON.parse(fs.readFileSync('./src/components/map/api/CoordenadasMultipoligono.json'));

let todas = { ...completas };

// Include the 11 multipolygons
multipoligono.datos.forEach(mp => {
   todas[mp.codigo] = {
       type: mp.type,
       coordenadasGeograficas: mp.coordenadasGeograficas
   };
});

fs.writeFileSync('./src/components/map/api/CoordenadasTodas.json', JSON.stringify(todas));
console.log('Merged coordinates into CoordenadasTodas.json, total keys: ', Object.keys(todas).length);
