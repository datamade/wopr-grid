(function(){
    var grid_layer;
    var jenks_cutoffs;
    var endpoint = 'http://wopr.datamade.us/api'
    var map = L.map('map').fitBounds([[41.644286009999995, -87.94010087999999], [42.023134979999995, -87.52366115999999]]);
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/datamade.hn83a654/{z}/{x}/{y}.png', {
        attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
    }).addTo(map);
    var grid_data = {
        year: 2013,
        dataset: 'chicago_crimes_all',
        human_name: 'Crimes - 2001 to present',
        resolution: 0.0111,
    }
    var legend = L.control({position: 'bottomleft'});
    legend.onAdd = function(map){
        var div = L.DomUtil.create('div', 'legend')
        var labels = [];
        var from;
        var to;
        $.each(jenks_cutoffs, function(i, grade){
            from = grade
            to = jenks_cutoffs[i + 1];
            labels.push('<i style="background:' + getColor(from) + '"></i>' +
                       from + (to ? '&ndash;' + to : '+'));
        });
        div.innerHTML = '<div><strong>' + grid_data['human_name'] + '</strong><br />' + labels.join('<br />') + '</div>';
        return div
    }
    var map_colors = [
        '#deebf7',
        '#c6dbef',
        '#9ecae1',
        '#6baed6',
        '#4292c6',
        '#2171b5',
        '#084594'
    ]
    metaUpdate(grid_data);
    loadLayer(grid_data);
    function loadLayer(grid_data){
        $('#map').spin('large');
        var url = endpoint + '/grid/' + grid_data['year'] + '/'
        $.when(getGrid(url, grid_data['dataset'], grid_data['resolution'])).then(
            function(grid){
                $('#map').spin(false);
                var values = [];
                $.each(grid['features'], function(i, val){
                    values.push(val['properties']['count']);
                });
                jenks_cutoffs = jenks(values, 6);
                jenks_cutoffs[0] = 0;
                jenks_cutoffs.pop();
                if (typeof grid_layer !== 'undefined'){
                    map.removeLayer(grid_layer);
                }
                grid_layer = L.geoJson(grid, {
                    pointToLayer: function(feature, latlng){
                        var res = grid_data['resolution'] / 2;
                        var sw = [latlng.lat + res, latlng.lng - res]
                        var ne = [latlng.lat - res, latlng.lng + res]
                        var style = styleGrid(feature)
                        return  L.rectangle([sw, ne], style);
                    },
                    onEachFeature: function(feature, layer){
                        var content = '<h4>Count: ' + feature.properties.count + '</h4>';
                        layer.bindLabel(content);
                    }
                }).addTo(map);
                $('#dataset-name').text(grid_data['human_name']);
                try{legend.removeFrom(map);}catch(e){};
                legend.addTo(map);
            }
        );
    }

    function getColor(d){
        return d >= jenks_cutoffs[5] ? map_colors[6] :
               d >= jenks_cutoffs[4] ? map_colors[5] :
               d >= jenks_cutoffs[3] ? map_colors[4] :
               d >= jenks_cutoffs[2] ? map_colors[3] :
               d >= jenks_cutoffs[1] ? map_colors[2] :
               d >= jenks_cutoffs[0] ? map_colors[1] :
                                       map_colors[0];
    }

    function styleGrid(feature){
        return {
            fillColor: getColor(feature.properties.count),
            weight: 0.3,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.7
        };
    }

    function getGrid(url, dataset, resolution){
        var data = {
            dataset_name: dataset,
            resolution: resolution
        }
        return $.getJSON(url, data)
    }

    function metaUpdate(grid_data){
        $('.meta').spin('large');
        var tpl = new EJS({text: $('#metaControl').html()})
        $.when($.getJSON(endpoint + '/')).then(
            function(datasets){
                $(self._div).spin(false);
                var data = {
                    human_name: grid_data['human_name'],
                    year: grid_data['year'],
                    datasets: [],
                    resolution: grid_data['resolution']
                }
                $.each(datasets, function(i, set){
                    data['datasets'].push(set);
                });
                $('.meta').html(tpl.render(data));
                $('#dataset-picker').on('change', function(e){
                    grid_data['dataset'] = $(this).val();
                    grid_data['human_name'] = $(this).find(':selected').text();
                    loadLayer(grid_data);
                })
                $('#year-picker').on('change', function(e){
                    grid_data['year'] = $(this).val();
                    loadLayer(grid_data);
                })
                $('#resolution-picker').on('change', function(e){
                    grid_data['resolution'] = $(this).val();
                    loadLayer(grid_data);
                })
            }
        )
    }
})()
