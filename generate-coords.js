const fs = require('fs');
const topojson = require('topojson-client');

// 1. Read TopoJSON files
const muniTopo = JSON.parse(fs.readFileSync('/www/wwwroot/seamovil.com/sea-subnacionales/resources/js/data/municipios.json'));
const deptTopo = JSON.parse(fs.readFileSync('/www/wwwroot/seamovil.com/sea-subnacionales/resources/js/data/departamentos.json'));

// 2. Convert to GeoJSON features
const muniGeo = topojson.feature(muniTopo, muniTopo.objects.Municipios339MEF).features;
const deptGeo = topojson.feature(deptTopo, deptTopo.objects.SoloDepartamentos).features;

// 3. Create a map of ID -> Geometry
const allCoordsMap = {};

muniGeo.forEach(f => {
    // Municipios have codigomef matching DB id directly
    let id = parseInt(f.properties.codigomef, 10);
    allCoordsMap[id] = {
        type: f.geometry.type,
        coordenadasGeograficas: f.geometry.type === 'Polygon' ? f.geometry.coordinates[0] : f.geometry.coordinates
    };
});

deptGeo.forEach(f => {
    // Departamentos have c_ut_dep like '01' -> 901
    let id = 900 + parseInt(f.properties.c_ut_dep, 10);
    allCoordsMap[id] = {
        type: f.geometry.type,
        coordenadasGeograficas: f.geometry.type === 'Polygon' ? f.geometry.coordinates[0] : f.geometry.coordinates
    };
});

// Since GAR and GAIOC are made of municipalities but don't have explicit geometries here,
// we just add them as is, or we'll allow apiMap.tsx to inject coordinates using the dictionary!

fs.writeFileSync('/www/wwwroot/sea/cedia-frontend/src/components/map/api/CoordenadasCompletas.json', JSON.stringify(allCoordsMap));
console.log('Generated CoordenadasCompletas.json');
