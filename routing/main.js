const mymap = L.map('mymap', {
    fullscreenControl: true
}).setView([25,0], 3);
let OpenStreetMap_Mapnik = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoia3VtYnJhMTIzIiwiYSI6ImNqc2hvMWtibjBocTE0M2tna29naHNmNGcifQ.o-TNVWeWVNvMrKsHyawcbw', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1Ijoia3VtYnJhMTIzIiwiYSI6ImNqc2hvMWtibjBocTE0M2tna29naHNmNGcifQ.o-TNVWeWVNvMrKsHyawcbw'
}).addTo(mymap);
L.control.scale().addTo(mymap);
let layersCar = [];
let layersBike = [];
let fuelCalc = {
    routeCalculated: false,
    div: '',
    fuel: 0,
    e: ''
}
getLocation();

function createButton(label, container) {
    var btn = L.DomUtil.create('button', '', container);
    btn.setAttribute('type', 'button');
    btn.innerHTML = label;
    return btn;
}
//Geting route for a car
let car = L.Routing.control({
        router: L.Routing.mapbox('pk.eyJ1Ijoia3VtYnJhMTIzIiwiYSI6ImNqc2hvMWtibjBocTE0M2tna29naHNmNGcifQ.o-TNVWeWVNvMrKsHyawcbw'),
        lineOptions: {
            styles: [{color: 'white', opacity: 0, weight: 5}]
         },
        show: false,
        draggableWaypoints: false,
        addWaypoints: false,
        fitSelectedRoutes:true
      }).addTo(mymap);
let bike = L.Routing.control({
router: L.Routing.mapbox('pk.eyJ1Ijoia3VtYnJhMTIzIiwiYSI6ImNqc2hvMWtibjBocTE0M2tna29naHNmNGcifQ.o-TNVWeWVNvMrKsHyawcbw', {profile:'mapbox/cycling'}),
lineOptions: {
    styles: [{color: 'white', opacity: 0, weight: 5}]
    },
show: false,
draggableWaypoints: false,
addWaypoints: false,
fitSelectedRoutes:true
}).addTo(mymap);

//When route is found
car.on('routesfound', function(e) {
    let latlong = [];
    for(let i = 0;i <e.routes[0].coordinates.length;i++){
        let {lat, lng} = e.routes[0].coordinates[i];
        latlong[i]=[lat,lng]
    }
    layersCar[0] = L.polyline(latlong, {
        snakingSpeed: 200,    
        weight: 9,
        color: 'black',
        opacity: 0.15});
    layersCar[1] = L.polyline(latlong, {
        snakingSpeed: 200,    
        weight: 6,
        color: 'white',
        opacity: 0.8});
    layersCar[2] = L.polyline(latlong, {
        snakingSpeed: 200,    
        weight: 2,
        color: 'red',
        opacity: 1});
    for(let i =0; i<layersCar.length;i++){
        layersCar[i].addTo(mymap).snakeIn();
    }
    let div = document.getElementById('calculate');
    div.setAttribute("class", "question");
    let fuel = document.getElementById('fuel');
    fuelCalc.routeCalculated = true;
    addText(div, e, fuel);  
});

//Getting route for a bicycle
bike.on('routesfound', function(e) {
        let route = e.routes[0];

            let latlong = [];
            let lngOfLn = 1000;

        if(route.summary.totalDistance/1000 > 100){
            lngOfLn = 10000;
        }else if(route.summary.totalDistance/1000 > 500){
            alert("Routes are not calulated for more than 500 kilometers");
            return;
        }

        for(let i = 0;i < route.coordinates.length;i++){
            let lat = route.coordinates[i].lat;
            let lng = route.coordinates[i].lng;
            latlong[i]=L.latLng(lat,lng);
            i === route.coordinates.length-1? breakeLine(latlong, lngOfLn):"";
        }

        layersBike[0] = L.polyline(latlong, {
            snakingSpeed: 200,    
            weight: 9,
            color: 'black',
            opacity: 0.15});
        layersBike[1] = L.polyline(latlong, {
            snakingSpeed: 200,    
            weight: 6,
            color: 'white',
            opacity: 0.8});
        layersBike[2] = L.polyline(latlong, {
            snakingSpeed: 200,    
            weight: 2,
            color: 'blue',
            opacity: 1});
        for(let i = 0; i <layersBike.length;i++){
            layersBike[i].addTo(mymap).snakeIn();
        }
    });

    //When clicked on map it opens up button with option to select route from/to that point
    mymap.on('click', function(e) {
        var container = L.DomUtil.create('div'),
            startBtn = createButton('Start from this location', container),
            destBtn = createButton('Go to this location', container);
    
        L.popup()
            .setContent(container)
            .setLatLng(e.latlng)
            .openOn(mymap);
        
        L.DomEvent.on(startBtn, 'click', function() {
            car.spliceWaypoints(0, 1, e.latlng);
            bike.spliceWaypoints(0, 1, e.latlng);
            if(layersBike.length > 2 || layersCar > 2){
                for(let i =0; i<layersCar.length;i++){
                    mymap.removeLayer(layersCar[i]);
                }
                for(let i = 0; i <layersBike.length;i++){
                    mymap.removeLayer(layersBike[i]);
                }
            }
            mymap.closePopup();
        });
    
        L.DomEvent.on(destBtn, 'click', function() {
            car.spliceWaypoints(car.getWaypoints().length - 1, 1, e.latlng);
            bike.spliceWaypoints(bike.getWaypoints().length - 1, 1, e.latlng);
            if(layersBike.length > 2 || layersCar > 2){
                for(let i =0; i<layersCar.length;i++){
                    mymap.removeLayer(layersCar[i]);
                }
                for(let i = 0; i <layersBike.length;i++){
                    mymap.removeLayer(layersBike[i]);
                }
            }
            mymap.closePopup();
        });
    });

    //Adding option in geocoder to add option for starting and ending point
    let searchControl = L.esri.Geocoding.geosearch({
        placeholder: "Enter start point",
        zoomToResult: false,
        useMapBounds: false
    }).addTo(mymap);

    searchControl.on("results", function(data) {
        if(searchControl.options.placeholder === "Enter start point" && data.latlng){
            car.spliceWaypoints(0, 1, data.latlng);
            bike.spliceWaypoints(0, 1, data.latlng);
            if(layersBike.length > 2 || layersCar > 2){
                for(let i =0; i<layersCar.length;i++){
                    mymap.removeLayer(layersCar[i]);
                }
                for(let i = 0; i <layersBike.length;i++){
                    mymap.removeLayer(layersBike[i]);
                }
            }
            searchControl.options.placeholder = "Enter destination point";
        }else if(searchControl.options.placeholder === "Enter destination point" && data.latlng){
            car.spliceWaypoints(car.getWaypoints().length - 1, 1, data.latlng);
            bike.spliceWaypoints(bike.getWaypoints().length - 1, 1, data.latlng);
            if(layersBike.length > 2 || layersCar > 2){
                for(let i =0; i<layersCar.length;i++){
                    mymap.removeLayer(layersCar[i]);
                }
                for(let i = 0; i <layersBike.length;i++){
                    mymap.removeLayer(layersBike[i]);
                }
            }
            searchControl.options.placeholder = "Enter start point";
        }
    });

    //Calculation
      function addText(div, e, fuel){
        fuelCalc = {
            ...fuelCalc,
            div,
            e,
            fuel
        }
        div.innerHTML = "";
        div.innerHTML +="<p>Covered kilometers per year: " + (e.routes[0].summary.totalDistance*252*2/1000).toFixed(2) + " km (Go and back)</p>"; 
        div.innerHTML +="<p>Route length: " + (e.routes[0].summary.totalDistance/1000).toFixed(2) + " km</p>"; 
        div.innerHTML +="<p>Liters of fuel per year: " + (e.routes[0].summary.totalDistance*252*2/100000*fuel.value).toFixed(2) +" l</p>";
        div.innerHTML +="<p>Dkk spent on fuel yearly: " + (e.routes[0].summary.totalDistance*252*2/100000*fuel.value*11.07).toFixed(2) +" dkk</p>";
        div.innerHTML +="<p>Kilos of CO2 produced per year: " + (e.routes[0].summary.totalDistance*252*2/1000*130/1000).toFixed(2) + " kg</p>" ;
      }  

      function breakeLine(latlong, lngLine){
          let coords = [];
          let acc = 0;
          for(let i = 0;i < latlong.length; i++){
              if(latlong.length - 1 === i){
                coords.push([latlong[latlong.length - 1].lat,latlong[latlong.length - 1].lng]);
                elevation(coords);
             }else {
                i===0?coords.push([latlong[i].lat,latlong[i].lng]):"";
                let dist = latlong[i].distanceTo(latlong[i+1]);
                acc += dist;
                if(acc > lngLine){
                    coords.push([latlong[i+1].lat,latlong[i+1].lng]);
                    acc-=lngLine;
                }
             }
          }
      }
      //Get elevation for a bicycle path
      function elevation(points){ 
        let elevations = [];
        let count = [];
        for(let i = 0;i < points.length;i++){
            let http = new XMLHttpRequest();
            let url = `https://elevation-api.io/api/elevation?points=${points[i]}`;
            http.open("GET", url);
            http.responseType = "json";
            http.send();
            http.onreadystatechange=(e)=>{
                if(http.readyState===4 && http.status===200){
                    elevations[i] = http.response.elevations[0].elevation;
                    count.push('true');
                    if(count.length === points.length){
                        createChart(elevations);
                        count = [];
                    }
                }
            }  
        }
      }  

      //Showing elevation as a chart
      function createChart(elevationss){
        let myChart;
        let labelsKm = [];
      for(let i = 1;i < elevationss.length; i++){
         labelsKm[0] = "Start";
         if(i===elevationss.length-1){
            labelsKm[i] = "End of route";
         }else{
            labelsKm[i] = i.toString();
         }
      }

      myChart? myChart.destroy() : "";
      var ctx = document.getElementById("myChart").getContext('2d');
      myChart = new Chart(ctx, {
          type: 'line',
          data: {
              labels: labelsKm,
              datasets: [{
                  label: 'Elevation of a bike path',
                  data: elevationss,
                  backgroundColor: [
                      'rgba(255, 99, 132, 0.2)',
                      'rgba(54, 162, 235, 0.2)',
                      'rgba(255, 206, 86, 0.2)',
                      'rgba(75, 192, 192, 0.2)',
                      'rgba(153, 102, 255, 0.2)',
                      'rgba(255, 159, 64, 0.2)'
                  ],
                  borderColor: "white",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  pointHoverRadius: 5,
                  borderWidth: 1,
                  color: "white",
              }]
          },
          options: {
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero:true
                      }
                  }]
              }
          }
      });
;}

//Update Calculations
function updateCalc(){
    if(!fuelCalc.routeCalculated){
        return;
    }
    addText(fuelCalc.div, fuelCalc.e, fuelCalc.fuel );
};

//Get users location
function getLocation() {    
    fetch('https://ipapi.co/json')
        .then(res => res.json())
        .then(location => {
        mymap.flyTo(new L.LatLng(location.latitude, location.longitude), 12);
    });
}

function openInNewTab(url) {
var win = window.open(url, '_blank');
win.focus();
};       