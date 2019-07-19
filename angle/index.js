var map = L.map('mapid').setView([47.36012, 13.451664447784426], 5);
var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let temLayer = L.layerGroup().addTo(map);
let rightClick = true;
map.doubleClickZoom.disable();
let distance;

//Disabling unnecessary widgets
map.pm.addControls({
    drawMarker : false,
    drawRectangle : false,
    drawPolygon: false,
    drawCircle: false,
    editMode: false,
    dragMode: false,
    cutPolygon: false,
    removalMode: false
});

//When user start drawing polylines this function follows
map.on('pm:drawstart', ({ workingLayer }) => {
    workingLayer.on('pm:vertexadded', e => {
      const segment = e.workingLayer.pm._layer._latlngs;
      if(e.workingLayer._parts.length > 0){
          temLayer.clearLayers();
          let p1 = [segment[0].lat, segment[0].lng];
          let p2 = [segment[1].lat, segment[1].lng];
          distances(p1);
          createPoly(p1, p2);
          map.pm.Draw.Line._removeLastVertex();
          drawCircle(p1, p2);
      }
    });
  });

let test = document.getElementsByClassName('action-finish');
test[0].onclick = function(){
  map.pm.disableDraw();
  map.off('mousemove');
}

function distances(p1) {
    let lat;
    let lng;
  map.addEventListener('mousemove', function(ev) {
    lat = ev.latlng.lat;
    lng = ev.latlng.lng;
    distance = (L.latLng(p1[0], p1[1]).distanceTo(L.latLng(lat, lng)));
 }); 
}

//Creating polylines
function createPoly (p1, p2){
  let poly = L.polyline([p1, p2], {color: 'red'}).addTo(map);
  temLayer.addLayer(poly);
};

//Circle disapear on method provided by pm library indicating that drawing is ended
map.on('pm:drawend', () => {
  temLayer.clearLayers();
  map.off('mousemove');
  let divatore = document.getElementsByClassName('popup');
  divatore[0].style.display = 'none';
});


//End action on double click
map.on('dblclick', () => {
  map.pm.disableDraw();
  map.off('mousemove');
});

//Drawing circles
function drawCircle(p1, p2) {
  map.on('mousemove', e => captureMove(e, p1, p2));
};

function captureMove(evt, p1, p2){
  let p3 =  map.latLngToContainerPoint(p1);
  let p4 =  map.latLngToContainerPoint(p2);
  let evt1 = map.latLngToContainerPoint(evt.latlng);
  let firstAngle = Math.atan2(p4.x - p3.x, p4.y - p3.y) * 180 / Math.PI + 180;
  let secondAngle = Math.atan2(evt1.x - p3.x, evt1.y - p3.y) * 180 / Math.PI + 180;
  firstAngle < 0? firstAngle +=360:''
  secondAngle < 0? secondAngle +=360:''
  rightClick? createCircle(p1, secondAngle, firstAngle): createCircle(p1, firstAngle, secondAngle);
}

map.on('contextmenu', () => {
  rightClick? rightClick = false: rightClick = true;
  map.fireEvent("on" + event.eventType, 'pm:drawstart');
});

function createCircle(p1, ang1, ang2){
  let noOfLayers = temLayer.getLayers();
  if(noOfLayers.length > 1){
    temLayer.removeLayer(noOfLayers[1]);
  } 
  ang1 < ang2?ang1+=360:''
  
  var circle = L.semiCircle(p1, {
      radius: distance/2,
        startAngle: 360 - ang1,
        stopAngle: 360 - ang2,
        color: 'rgba(255,0,0,0.5)',
    });
  temLayer.addLayer(circle);
  angleDeg(ang1, ang2);
};

function angleDeg(ang1, ang2){
  let number = (ang1 - ang2).toFixed(4).toString();
  let divatore = document.getElementsByClassName('popup');
  divatore[0].style.display = 'block';
  divatore[0].innerHTML = number;
}