/**
 * Update the layer switcher with the window.layers array
 *
 * @return void
 */
function updateLayers() {
    $('.leaflet-control-switcher').html('');
    for (var layerId in window.Layers) {
        var layer = window.Layers[layerId];
        $('.leaflet-control-switcher').append(
            '<option value="'+layer.id+'" ' +(window.currentLayer.name == layer.name ? ' selected="selected"' : '') +'>'+layer.name+'</option>'
        );
    }
    if (Object.keys(window.Layers).length > 0) {
        $('.leaflet-control-switcher-box').show();
    } else {
        $('.leaflet-control-switcher-box').hide();
    }
}

/**
 * Remove all the layers from the map.
 *
 * @return void
 */
function clearMap() {
    for (var layerId in window.Layers) {
        window.Layers[layerId].remove();
    }
    window.Layers = {};
    updateLayers();
}

/**
 * Class LayerOptimizer
 *
 * @constructor
 * @param source the source layer
 */
var LayerOptimizer = function(source) {

    this.id = this.createId();
    this.name = source.filename;

    //
    // Source layer part
    // 
    this.sourceLayer = source.layer;

    this.size = source.layer.getLayers().length;
    this.sourceLayerStyle = {
        color: 'red',
        opacity: 0.7,
        fillOpacity: 0.7,
        weight: 5,
        clickable: false
    };
    // Array of source layers
    this.sourceLayerData = [];
    this.sourceLayerJSON = [];
    this.sourceLayerOptions = [];
    this.sourceLayerNodes = 0;

    //
    // Simplified layer part
    // 
    this.simplifiedLayerStyle = {
        color: 'blue',
        opacity: 1.0,
        fillOpacity: 1.0,
        weight: 2,
        clickable: false
    };
    // Array of simplified layers
    this.simplifiedLayerData = [];
    this.simplifiedLayerNodes = 0;

    this.controller = null;
    this.tolerance = 0;

    this.init();
}

LayerOptimizer.prototype = {

    /**
     * Retrieve source layer in GeoJSON format
     *
     * @return the GeoJson layer object
     */
    init: function() {

        var allLayers = [];
        var layer;
        for (var i=0; i<this.size; i++) {
            // Retrieve each layer
            layer = this.sourceLayer.getLayers()[i].toGeoJSON();
            if (layer.geometry.type === 'GeometryCollection') {
                // This part was added to handle issue #12
                // We extract the GeometryCollection into several classic layers
                for (var subi=0; subi<layer.geometry.geometries.length; subi++) {
                    var fakeLayer = JSON.parse(JSON.stringify(layer));
                    // Retrieve the geometry
                    fakeLayer.geometry = layer.geometry.geometries[subi];
                    // Split the « name » into « name #x » to identify each
                    fakeLayer.properties.name = layer.properties.name + " #"+subi; //layerName;
                    // Retrieve the coordinates
                    fakeLayer.geometry.coordinates = fakeLayer.geometry.coordinates[0];
                    allLayers.push(fakeLayer);
                }
            } else {
                allLayers.push(layer);
            }
        }

        this.size = allLayers.length;
        for (var j=0; j<this.size; j++) {
            this.initLayer(allLayers[j], j);
        }
    },

    initLayer: function(layer, i) {

        this.sourceLayerOptions[i] = {};
        // Force the use of LineString because Leaflet doesn't simplify Polygon
        // We save it in sourceLayerOptions for later use, but for now it's not used at all
        if (layer.geometry.type !== "LineString") {
            this.sourceLayerOptions[i].type = layer.geometry.type;
            layer.geometry.type = "LineString";
        }
        this.sourceLayerJSON[i] = layer;
        this.sourceLayerData[i] = L.geoJson(null, { style : this.sourceLayerStyle}).addTo(window.map);
        this.sourceLayerData[i].addData(layer);

        // Count nodes
        this.sourceLayerNodes     += layer.geometry.coordinates.length
        this.simplifiedLayerNodes += layer.geometry.coordinates.length

        // Create simplified copy
        this.simplifiedLayerData[i] = L.geoJson(layer, { style : this.simplifiedLayerStyle}).addTo(window.map);

    },

    /**
     * Choose this layer, and display everything for it
     *
     * @return void
     */
    choose: function() {
        this.zoom();
        this.createLayerGroup();
        this.displayInfos();
        this.displaySizeFormats();
        // Put back this layer's tolerance into the slider
        $("#slider").slider('setValue', this.tolerance);
    },

    /**
     * Optimize the layer according to the given tolerance
     *
     * @param float tolerance the tolerance between 0 and 1
     *
     * @return void
     */
    optimize: function(tolerance) {
        this.simplifiedLayerNodes = 0;
        var newcoords;
        var simplifiedJSON;
        for (var i=0; i<this.size; i++) {
            newcoords = simplifyGeometry(this.sourceLayerJSON[i].geometry.coordinates, tolerance);

            simplifiedJSON = this.simplifiedLayerData[i].getLayers()[0].toGeoJSON();
            simplifiedJSON.geometry.coordinates = newcoords;
            this.simplifiedLayerData[i].clearLayers();
            //console.log(JSON.stringify(simplifiedJSON));
            this.simplifiedLayerData[i].addData(simplifiedJSON);

            this.simplifiedLayerNodes += newcoords.length;

        }
        this.displaySizeFormats();

        // Save selected tolerance for later use.
        this.tolerance = tolerance;
    },

    /**
     * Get the source layer bounds
     *
     * @return the bounds
     */
    getBounds: function() {
        return this.sourceLayer.getBounds();
    },

    /**
     * Zoom to the current layer bounds
     *
     * @return void
     */
    zoom: function() {
        window.map.fitBounds(this.getBounds());
    },

    /**
     * Create a group layer with the source and simplified layer
     *
     * Add the group layer to the Leaflet object
     *
     * @return void
     */
    createLayerGroup: function() {
        var layers = {};
        var name;
        for (var i=0; i<this.size; i++) {
            if (this.sourceLayerJSON[i].properties && this.sourceLayerJSON[i].properties.name) {
                name = this.sourceLayerJSON[i].properties.name;
            } else {
                name = this.name+' - '+$.t('layers.track')+' '+i;
            }
            layers[ $.t('layers.simplified') ] = this.simplifiedLayerData[i];
            layers[ $.t('layers.source') ] = this.sourceLayerData[i];
        }

        this.controller = L.control.layers(null, layers, {collapsed : false});
        this.controller.addTo(window.map);
        $('.leaflet-control-layers-selector').on('click', function() {
            window.currentLayer.displaySizeFormats();
        });

    },

    /**
     * Display the layers data in the filename/nodes object
     *
     * @return void
     */
    displayInfos: function() {
        var title = $.t('layers.infos.title', {'name': this.name});
        var nodes = $.t('layers.infos.nodes', {'sourcenodes': this.sourceLayerNodes, 'simplifiednodes': this.simplifiedLayerNodes});
        $('#filename').html(title);
        $('#nodes').html(nodes);
        $('.leaflet-control-stats').show();
    },

    /**
     * Count the number of tracks and nodes
     * 
     * @return object an object with tracks & nodes properties
     */
    countTracksNodes: function() {
        var tracks=0;
        var nodes=0;
        for (var i=0; i<this.size; i++) {

            layer = this.simplifiedLayerData[i].getLayers()[0];
            //console.log(jsonify(layer));
            //console.log(jsonify(window.map.layers));
            if (window.map.hasLayer(layer)) {
                tracks++;
                nodes += layer.toGeoJSON().geometry.coordinates.length;
            }
        }
        return {"tracks": tracks, "nodes": nodes};
    },

    /**
     * Display the size for the differents formats
     *
     * @return void
     */
    displaySizeFormats: function() {
        var counters = this.countTracksNodes();

        $('#size-format .sizes').html('');
        var size = 0;
        for (var j=0; j<window.formats.formats.length; j++) {
            f = window.formats.formats[j];
            size = f.getSize(counters.tracks, counters.nodes);
            $('#size-format .sizes').append('<p><span class="format-name">'+f.param.name+' :</span><span class="format-size">'+size+'</span></p>');
        }
        $('#size-format').show();
    },

    /**
     * Clear infos of the current layer
     *
     * @return void
     */
    clearInfos: function() {
        $('#filename').html('');
        $('#nodes').html('');
        $('.leaflet-control-stats').hide();
    },

    /**
     * Clear infos of the current layer
     *
     * @return void
     */
    clearSizeFormats: function() {
        $('#size-format').hide();
    },

    /**
     * Remove all the data from the layer optimizer
     *
     * @return void
     */
    remove: function() {
        this.removeLayers();
        this.removeController();
        this.clearInfos();
        this.clearSizeFormats();
    },

    /**
     * Remove the simplified and source layers
     *
     * @return void
     */
    removeLayers: function() {
        for (var i=0; i<this.size; i++) {
            try {
                window.map.removeLayer(this.sourceLayerData[i]);
            } catch (e) {
                console.log($.t('layers.error.layer'));
            }
            try {
                window.map.removeLayer(this.simplifiedLayerData[i]);
            } catch (e) {
                console.log($.t('layers.error.layer'));
            }
        }
    },

    /**
     * Remove the layer controller
     *
     * @return void
     */
    removeController: function() {
        try {
            if (this.controller._map !== undefined) {
                this.controller.removeFrom(window.map);
            }
        } catch (e) {
            console.log($.t('layers.error.controller'));
        }
    },

    /**
     * Create a unique id for the layer
     *
     * @return the unique 16 chars id
     */
    createId: function() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + s4() + s4();
    }

};

