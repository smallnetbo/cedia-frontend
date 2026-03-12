const fs = require('fs');
const topojson = require('topojson-client');

const topoData = JSON.parse(fs.readFileSync('/www/wwwroot/seamovil.com/sea-subnacionales/resources/js/data/municipios.json'));
const geojson = topojson.feature(topoData, topoData.objects.Municipios339MEF);

const result = {
    datos: geojson.features.map(f => {
        // the coordinates in geojson are either [ [ [...] ] ] for Polygon or [ [ [ [...] ] ] ] for MultiPolygon
        return {
            codigo: f.properties.c_ut_dep,
            type: f.geometry.type,
            coordenadasGeograficas: f.geometry.type === 'Polygon' ? f.geometry.coordinates[0] : f.geometry.coordinates
        };
    })
};

fs.writeFileSync('/www/wwwroot/sea/cedia-frontend/src/components/map/api/CoordenadasGenerales.json', JSON.stringify(result, null, 2));
console.log('Generated CoordenadasGenerales.json with length ' + result.datos.length);
