let togle;
let markers = [];

let mymap = L.map('mapid').setView([51.505, 0], 4);
var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);

let bounds = mymap.getBounds();

for(let i = 0;i < 100;i++){
    let north = bounds._northEast;
    let south = bounds._southWest;
    marker = L.marker([latitude(north.lat, south.lat), longitude(north.lng, south.lng)]);
    marker.numerable = Math.floor(Math.random() * ((10 - 1) + 1) + 1);
    markers.push(marker);
}
L.control.scale().addTo(mymap);

function latitude(north, south) {
return Math.floor(Math.random() * (north - south) + 1) + south;
}
function longitude(north, south) {
return Math.floor(Math.random() * (north - south) + 1) + south;
}

//slider
var elem = document.querySelector('input[type="range"]');

function rangeValue(){
    var newValue = elem.value;
    var target = document.querySelector('.value');
    target.innerHTML = newValue;
    showMarkers(newValue);
}
elem.addEventListener("input", () => {
    rangeValue();
    togle = 1;
});

function showMarkers(val){
    let show = markers.filter(x => x.numerable <= val);
    console.log(show[0]);
    let hide = markers.filter(x => x.numerable > val);
    for(let i = 0;i < show.length; i++){
        show[i].addTo(mymap);
    }
    for(let i = 0;i < hide.length; i++){
        mymap.removeLayer(hide[i]);
    }
}
function auto(){
    setInterval(function(){ 
        if(elem.value <=10 && togle != 1){
            elem.value++;
            rangeValue();
        }
     }, 1000);
}
auto();

function openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
}