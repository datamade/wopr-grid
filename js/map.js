(function(){
    var endpoint = 'http://wopr.datamade.us/api'
    var map = L.map('map').fitBounds([[41.644286009999995, -87.94010087999999], [42.023134979999995, -87.52366115999999]]);
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/derekeder.hehblhbj/{z}/{x}/{y}.png', {
        attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
    }).addTo(map);
    var meta = L.control({position: 'bottomright'});
    var grid_data = {
        year: 2013,
        dataset: 'chicago_crimes_all',
        human_name: 'Crimes - 2001 to present',
        resolution: 0.01,
    }
    meta.onAdd = function(map){
        this._div = L.DomUtil.create('div', 'meta');
        return this._div;
    }
    meta.update = function(grid_data){
        $(this._div).spin('large');
        var self = this;
        var tpl = new EJS({text: $('#metaControl').html()})
        $.when($.getJSON(endpoint + '/')).then(
            function(datasets){
                $(self._div).spin(false);
                var data = {
                    human_name: grid_data['human_name'],
                    year: grid_data['year'],
                    datasets: []
                }
                $.each(datasets, function(i, set){
                    data['datasets'].push(set);
                });
                $(self._div).html(tpl.render(data));
              //$('#dataset-picker').on('change', function(e){
              //    console.log($(this).val());
              //})
            }
        )
    }
    meta.addTo(map);
    meta.update(grid_data);
    loadLayer(grid_data);
    function loadLayer(grid_data){
        $('#map').spin('large');
        var url = endpoint + '/grid/' + grid_data['year'] + '/'
        $.when(getGrid(url, grid_data['dataset'], grid_data['resolution'])).then(
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
    }

    function getGrid(url, dataset, resolution){
        var data = {
            dataset_name: dataset,
            resolution: resolution
        }
        return $.getJSON(url, data)
    }
})()
