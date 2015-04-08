/**
 * Style for source Layer
 */
window.style1 = {
    color: 'red',
    opacity: 0.7,
    fillOpacity: 0.7,
    weight: 5,
    clickable: false
};

/**
 * Style for simplified layer
 */
window.style2 = {
    color: 'blue',
    opacity: 1.0,
    fillOpacity: 1.0,
    weight: 2,
    clickable: false
};

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
    this.sourceLayer = source.layer;
    this.sourceLayerStyle = window.style1;
    this.sourceLayerData = this.getSourceData();
    this.sourceLayerNodes = this.sourceLayerData.geometry.coordinates.length;

    this.simplifiedLayerStyle = window.style2;
    this.simplifiedLayer = L.geoJson(null, { style : this.simplifiedLayerStyle}).addTo(window.map);
    this.simplifiedLayerNodes = 0;
    this.controller = null;
}

LayerOptimizer.prototype = {

    /**
     * Retrieve source layer in GeoJSON format
     *
     * @return the GeoJson layer object
     */
    getSourceData: function() {
        return this.sourceLayer.getLayers()[0].toGeoJSON();
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
    },

    /**
     * Optimize the layer according to the given tolerance
     *
     * @param float tolerance the tolerance between 0 and 1
     *
     * @return void
     */
    optimize: function(tolerance) {
        this.simplifiedLayer.clearLayers();
        this.simplifiedLayerData = this.getSourceData();
		this.simplifiedLayerData.geometry.coordinates = simplifyGeometry(this.simplifiedLayerData.geometry.coordinates, tolerance);
        this.simplifiedLayer.addData(this.simplifiedLayerData);
        this.simplifiedLayerNodes = this.simplifiedLayerData.geometry.coordinates.length;
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
        layers[this.name+' (simplified)'] = this.simplifiedLayer;
        layers[this.name+' (source)'] = this.sourceLayer;
        this.controller = L.control.layers(null, layers);
        this.controller.addTo(window.map);
    },

    /**
     * Display the layers data in the filename/nodes object
     *
     * @return void
     */
    displayInfos: function() {
        var title = "Optimize : "+this.name;
        var nodes = "From "+this.sourceLayerNodes+" nodes to "+this.simplifiedLayerNodes+" nodes";
        $('#filename').html(title);
        $('#nodes').html(nodes);
    },

    /**
     * Remove all the data from the layer optimizer
     *
     * @return void
     */
    remove: function() {
        this.removeLayers();
        this.removeController();
    },

    /**
     * Remove the simplified and source layers
     *
     * @return void
     */
    removeLayers: function() {
        try {
            window.map.removeLayer(this.simplifiedLayer);
            window.map.removeLayer(this.sourceLayer);
        } catch (e) {
            console.log("Layers not found, probably already removed");
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
            console.log("Controller not found, probably already removed");
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

