(function(){
    var map = L.map('map').fitBounds([[41.644286009999995, -87.94010087999999], [42.023134979999995, -87.52366115999999]]);
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/derekeder.hehblhbj/{z}/{x}/{y}.png', {
        attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
    }).addTo(map);
    //var endpoint = 'http://127.0.0.1:5000/api'
    var endpoint = 'http://wopr.datamade.us/api'
    var dataset = 'chicago_crimes_all';
    var year = 2013
    var resolution = 0.01;
    $('#map').spin('large')
    $.when(getGrid(year, dataset, resolution)).then(
        function(grid){
            $('#map').spin(false);
            L.geoJson(grid, {
                pointToLayer: function(feature, latlng){
                    var size = feature.properties.count / 250;
                    return  L.circleMarker(latlng).setRadius(size);
                },
                onEachFeature: function(feature, layer){
                    var content = '<h4>Count: ' + feature.properties.count + '</h4>';
                    layer.bindPopup(content, {
                        closeButton: true,
                        minWidth: 320
                    })
                }
            }).addTo(map);
        }
    );
    function getGrid(year, dataset, resolution){
        var data = {
            dataset_name: dataset,
            resolution: resolution
        }
        return $.getJSON(endpoint + '/grid/' + year + '/', data)
    }
})()
