//Leaflet basemap
const map = new L.Map('map').setView([56.162739, 10.203211], 13);
const CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

//Data from Aarhus Municiplaity
let urls = ['https://portal.opendata.dk/api/3/action/datastore_search?resource_id=c3097987-c394-4092-ad1d-ad86a81dbf37',
          'https://portal.opendata.dk/api/3/action/datastore_search?resource_id=b3eeb0ff-c8a8-4824-99d6-e0a3747c8b0d'];

let both = [];
let markerLayer;
//Merging two tables and matching ID/s
function refreshData(){
  let count = 0;
  $.each(urls, function(k, u){
    $.ajax({url: u}).done((result) => both[k] = result.result.records)
    .then(()=>{
      count += 1;
      if(count === 2){
        concate();
      }
    });
   });
  function concate(){
    let randClass = 0;
    let markers = [];
    let teskaPrica = [];
    //Looping through both data to find matching ID/s
    $.each(both[0], (i,x)=> {
      $.each(both[1], (j,y)=>
      {
        if(y._id == x._id){
          randClass+=1;
          let speed;
          //Assign diffeent color depending of average speed
          if(y.avgSpeed <= 50){
            speed = '#37375e';
          }else if(y.avgSpeed > 50 && y.avgSpeed <= 80){
            speed = '#aacfdd';
          }else if (y.avgSpeed > 80){
            speed = '#fe1100';
          }
          //Custom icon
          let marker = L.divIcon({
            iconSize: [10, 10],
            iconAnchor: [5, 5],
            popupAnchor: [y.vehicleCount/2, 0],
            shadowSize: [0, 0],
            className: `animated-icon a${randClass}`
          });
          //Variable to store data for specific point
          teskaPrica.push({class: randClass,
                            noVehicles: y.vehicleCount * 3,
                            avgSpeed: speed});
          let popupContent = `Average speed : ${y.avgSpeed} \r\n
                             Number of vehicles: ${y.vehicleCount}`
          //Adding point to the map ant to the layer group
          let pop = L.marker([x.POINT_1_LAT, x.POINT_1_LNG],
          {icon: marker});
          pop.bindPopup(popupContent).openPopup();
          markers.push(pop);
        }
      });
    });
    //Preventing duplicating data
    if(markerLayer){
      markerLayer.eachLayer((layer)=> map.removeLayer(layer));
      randClass=0;
    }
    //Adding points to the map
    markerLayer = L.layerGroup(markers).addTo(map);
    animate(randClass, teskaPrica);
    setInterval(()=>animate(randClass, teskaPrica), 7000);
    ;
  }
}
//Selecting specific point 
function animate(randClass, teskaPrica){
  for(let i = 1;i <=randClass;i++){
    var myIcon = document.querySelector('.a'+ i);
    let data = teskaPrica.filter((x) => i == x.class);
    styling(myIcon, data);
  }
}
//Legends
let legend = L.control({ position: "bottomright" });
legend.onAdd = function(map) {
  var div = L.DomUtil.create("div", "legend");
  div.style.backgroundColor = 'white';
  div.style.padding = '1em';
  div.style.borderRadius = '10px';
  div.innerHTML += '<h3 style="text-align:center;box-shadow:0px 5px 12px -8px rgba(0,0,0,1);">Legend</h3>';
  div.innerHTML += '<svg height="100" width="160">'+
    '<foreignobject class="node" x="0" y="0" width="30" height="100">'+
    '<div style="padding:0.5em 0.5em 0.15em 0.5em; font-weight: bold;">20</div>'+
    '<div style="padding:0.1em 0.5em 0.15em 0.5em; font-weight: bold;">15</div>'+
    '<div style="padding:0.1em 0.5em 0.15em 0.5em; font-weight: bold;">10</div></foreignobject>'+             
    '<circle cx="120" cy="50" r="30" stroke="gray" stroke-width="1" fill-opacity="0"/>'+
    '<circle cx="120" cy="58" r="22.5" stroke="gray" stroke-width="1" fill-opacity="0"/>'+
    '<circle cx="120" cy="65" r="15" stroke="gray" stroke-width="1" fill-opacity="0"/>'+
    '<line x1="30" y1="20" x2="120" y2="20" style="stroke:gray;stroke-dasharray:4"/>'+
    '<line x1="30" y1="35" x2="120" y2="35" style="stroke:gray;stroke-dasharray:4"/>'+
    '<line x1="30" y1="50" x2="120" y2="50" style="stroke:gray;stroke-dasharray:4"/></svg>'+
    '<p style="box-shadow:0px -5px 13px -8px rgba(189,136,189,1);">Number represents counted vehicles <br>by Bluetooth device at given time<br>'
  return div;
}
legend.addTo(map);  
//Styling
function styling(myIcon, data){
  setTimeout(function(){
    myIcon.style.width = data[0].noVehicles + 'px';
    myIcon.style.height = data[0].noVehicles + 'px';
    myIcon.style.marginLeft = -(data[0].noVehicles/2) + 'px';
    myIcon.style.marginTop = -(data[0].noVehicles/2) + 'px';
    myIcon.style.borderRadius = '50%';
  }, 1000);

  setTimeout(function(){
    myIcon.style.borderRadius = '50%';
    myIcon.style.backgroundColor = data[0].avgSpeed;
    myIcon.style.boxshadow = `0px 0px 4px ${data[0].avgSpeed}`
  },3000);

  setTimeout(function(){
    myIcon.style.width = '10px';
    myIcon.style.height = '10px';
    myIcon.style.marginLeft = '-5px';
    myIcon.style.marginTop = '-5px';
    myIcon.style.backgroundColor = 'cyan';
    myIcon.style.borderRadius = '50%';
    myIcon.style.backgroundColor = 'rgba(236, 254, 255, 0.3)';
    }, 5000);
}
refreshData();
//Refresh data every 35 seconds
setInterval(refreshData, 35 * 1000);

function openInNewTab(url) {
var win = window.open(url, '_blank');
win.focus();
}