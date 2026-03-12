const fs = require('fs');
const topo = require('./src/components/map/api/CoordenadasMultipoligono.json');
const topoData = JSON.parse(fs.readFileSync('/www/wwwroot/seamovil.com/sea-subnacionales/resources/js/data/municipios.json'));
console.log(Object.keys(topoData.objects));
