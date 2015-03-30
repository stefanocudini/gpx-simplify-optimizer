window.style1 = {
    color: 'red',
    opacity: 0.7,
    fillOpacity: 0.7,
    weight: 5,
    clickable: false
};

window.style2 = {
    color: 'blue',
    opacity: 1.0,
    fillOpacity: 1.0,
    weight: 2,
    clickable: false
};


var LayerOptimizer = function(source) {
    this.sourceStyle = window.style1;

    this.sourceLayer = source.layer;
    this.sourceLayerName = source.filename;
    this.sourceLayerData = this.getSourceData();
    this.sourceLayerNodes = this.sourceLayerData.geometry.coordinates.length;

    this.simplifiedStyle = window.style2;
    this.simplifiedLayer = L.geoJson(null, { style : this.simplifiedStyle}).addTo(window.map);
    this.simplifiedLayerNodes = 0;
}

LayerOptimizer.prototype = {

    getSourceData: function() {
        return this.sourceLayer.getLayers()[0].toGeoJSON();
    },
    optimize: function(tolerance) {
        //console.log(tolerance);
        this.simplifiedLayer.clearLayers();
        this.simplifiedLayerData = this.getSourceData();
		this.simplifiedLayerData.geometry.coordinates = simplifyGeometry(this.simplifiedLayerData.geometry.coordinates, tolerance);
        this.simplifiedLayer.addData(this.simplifiedLayerData);
        this.simplifiedLayerNodes = this.simplifiedLayerData.geometry.coordinates.length;

    },

    getBounds: function() {
        return this.sourceLayer.getBounds();
    },

    createLayerGroup: function() {
        var layers = {};
        layers[this.sourceLayerName+' (simplified)'] = this.simplifiedLayer;
        layers[this.sourceLayerName+' (source)'] = this.sourceLayer;
        L.control.layers(null, layers).addTo(window.map);
    },

    display: function() {
        var title = "Optimize : "+this.sourceLayerName;
        var nodes = "From "+this.sourceLayerNodes+" nodes to "+this.simplifiedLayerNodes+" nodes";
        $('#filename').html(title);
        $('#nodes').html(nodes);



    },
    


    




};

