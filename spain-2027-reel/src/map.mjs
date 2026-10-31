import fs from 'fs';
import * as topojson from '/tmp/claude-0/-home-user-vwg/f7221f4f-7320-5e2c-85db-76bc3597f4f2/scratchpad/dl/node_modules/topojson-client/src/index.js';
const SP='/tmp/claude-0/-home-user-vwg/f7221f4f-7320-5e2c-85db-76bc3597f4f2/scratchpad';
const topo=JSON.parse(fs.readFileSync(SP+'/dl/node_modules/world-atlas/countries-10m.json'));
const want={Spain:'ES',Portugal:'PT',France:'FR',Morocco:'MA',Algeria:'DZ',Andorra:'AD'};
const out={};
for(const g of topo.objects.countries.geometries){
  if(want[g.properties.name]){
    const f=topojson.feature(topo,g);
    let polys = f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
    // keep only polygons within window
    polys = polys.filter(p=>{const c=p[0][0]; return c[0]>-12&&c[0]<6&&c[1]>34&&c[1]<45});
    // round
    out[g.properties.name]=polys.map(p=>p.map(r=>r.map(([x,y])=>[+x.toFixed(3),+y.toFixed(3)])));
  }
}
fs.writeFileSync(SP+'/build/map.json',JSON.stringify(out));
console.log(Object.keys(out), JSON.stringify(out).length);
