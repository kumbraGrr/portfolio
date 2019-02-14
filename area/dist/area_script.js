let props = {
    featureLayers: [],
    legendProp: [],
    query: [],
    year: []
};
require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/widgets/Legend",
    "esri/tasks/support/Query",
    "esri/widgets/Expand"
], function (Map, MapView, FeatureLayer, Legend, Query, Expand) {
    let map = new Map({
        basemap: "osm"
    });
    let view = new MapView({
        container: "viewDiv",
        map: map
    });
    //Iterating through all layers and add them to the map, legend and query all of them
    for (let i = 8; i >= 0; i--) {
        var url = "https://services1.arcgis.com/4yjifSiIG17X0gW4/arcgis/rest/services/London_historical_boundaries/FeatureServer/" + i;
        props.featureLayers[i] = new FeatureLayer({
            url: url,
            outFields: ["AreaSqKm", "Year"]
        });
        //Query area
        var queryLoc = props.featureLayers[i].createQuery();
        queryLoc.where = "OBJECTID > '0'";
        queryLoc.outFileds = ['area'];

        props.featureLayers[i].queryFeatures(queryLoc)
            .then((response) => { props.query.push(response.features[0].attributes.AreaSqKm);
                                  props.year.push(response.features[0].attributes.Year) 
                                  })
            .then(() => props.year.length == 9? createChart(): "");

        map.add(props.featureLayers[i]);
    }
    //Widget for a chart
    let widget = document.getElementById("widget");
    view.ui.add(widget, "top-right");
    
    props.featureLayers[8].when(() => {
        view.extent = props.featureLayers[8].fullExtent;
        })
        .then(function () { 

        //Responsive legend
    var expandLegend = new Expand({
        view: view,
        content: new Legend({
            view: view,
            container: document.createElement("div")
        }),
        mode: "drawer"
    });
    view.ui.add(expandLegend, "top-right");
    });
});

//Chart
let chartelony;

let chartDom = document.getElementsByClassName("ct-chart");
    
function createChart(){
    let data = {
        labels: props.year,
        series: [props.query]
    };
    let data2 = {
        low: 0,
        showArea: true,
        height: '40em'
        };

    chartelony = new Chartist.Line('.ct-chart', data, data2);
    chartDom[0].style.display = "none";
}
    
function chart(){
    if (chartDom[0].style.display == "none") {
      chartDom[0].style.display = "block";
      chartelony.update();
    } else {
      chartDom[0].style.display = "none";
    }
}
