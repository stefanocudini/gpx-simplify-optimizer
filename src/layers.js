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

function clone(obj) {
    if (null === obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
            copy[attr] = obj[attr];
        }
    }
    return copy;
}

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
    this.sourceLayerStyle = window.style1;
    // Array of source layers
    this.sourceLayerData = [];
    this.sourceLayerJSON = [];
    this.sourceLayerNodes =  0;

    //
    // Simplified layer part
    // 
    // Create simplified Layer from source.layer and clear all data
    //this.simplifiedLayer = $.extend(true, {}, source.layer);
    //this.simplifiedLayer.clearLayers();
    this.simplifiedLayerStyle = window.style2;
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

        var layer;
        for (var i=0; i<this.size; i++) {
            // Retrieve each layer
            layer = this.sourceLayer.getLayers()[i].toGeoJSON();
            this.sourceLayerJSON[i] = layer;
            this.sourceLayerData[i] = L.geoJson(null, { style : this.sourceLayerStyle}).addTo(window.map);
            this.sourceLayerData[i].addData(layer);

            // Count nodes
            this.sourceLayerNodes     += layer.geometry.coordinates.length
            this.simplifiedLayerNodes += layer.geometry.coordinates.length

            // Create simplified copy
            this.simplifiedLayerData[i] = L.geoJson(layer, { style : this.simplifiedLayerStyle}).addTo(window.map);
        }
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
            this.simplifiedLayerData[i].addData(simplifiedJSON);

            this.simplifiedLayerNodes += newcoords.length;

        }

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
        var simplifiedExt = ' ('+$.t('layers.simplified')+')';
        var sourceExt      = ' ('+$.t('layers.source')+')';
        for (var i=0; i<this.size; i++) {
            if (this.sourceLayerJSON[i].properties && this.sourceLayerJSON[i].properties.name) {
                name = this.sourceLayerJSON[i].properties.name;
            } else {
                name = this.name+' - '+$.t('layers.track')+' '+i;
            }
            layers[name+simplifiedExt] = this.simplifiedLayerData[i];
            layers[name+sourceExt] = this.sourceLayerData[i];
        }

        /*
        layers[this.name+' - '+$.t('layers.alltracks')+simplifiedExt] = this.simplifiedLayer;
        layers[this.name+' - '+$.t('layers.alltracks')+sourceExt] = this.sourceLayer;
        */

        this.controller = L.control.layers(null, layers);
        this.controller.addTo(window.map);
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
    },

    /**
     * Clear infos of the current layer
     *
     * @return void
     */
    clearInfos: function() {
        $('#filename').html('');
        $('#nodes').html('');
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

