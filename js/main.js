$(function() {

var map = new L.Map('map',{attributionControl: false}).setView(L.latLng(36,-30),3);
window.map = map;

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

//CONTROL UPLOAD
L.Control.FileLayerLoad.LABEL = '<i class="fa fa-folder-open"></i>';
var controlLoader = L.Control.fileLayerLoad({
	addToMap: true,
	fitBounds: false,
	fileSizeLimit: 8096,
	layerOptions: {
		style: style1,
		pointToLayer: function (data, latlng) {
			return L.circle(latlng, 10, {style: style1});
		}
	}
    
}).addTo(map);


window.Layers = [];
window.currentLayer = null;

// UPLOAD ACTION
controlLoader.loader.on('data:loaded', function (layerObject) {
    var layer = new LayerOptimizer(layerObject);
	//sourceLayer = e.layer;
	map.fitBounds( layer.getBounds() );
    layer.optimize(0);
    layer.createLayerGroup();
    layer.display();
    window.Layers.push(layer);
    window.currentLayer = layer;

    /*
	$('.grumble, .grumble-text, .grumble-button').remove();
	$(document).unbind('keyup.crumble');
    */
})
.on('data:error', function (e) {
	console.log('ERROR',e);
});

/*
// Airport From
(function() {
    var control = new L.Control({position:'topleft'});
    control.onAdd = function(map) {
            var ctrl = L.DomUtil.create('div','leaflet-control-planes leaflet-bar'),
                a = L.DomUtil.create('a','', ctrl);
            a.href = '#';
            a.target = '_blank';
            a.title = "Trace plane track";
            a.innerHTML = '<i class="fa icon-plane"></i>';
            L.DomEvent
                .on(a, 'click', L.DomEvent.stop)
                .on(a, 'click', chooseAirports);			
            return ctrl;
        };
    return control;
}()).addTo(window.map);
*/

//CONTROL DOWNLOAD
(function() {
	var control = new L.Control({position:'topleft'});
	control.onAdd = function(map) {
			var ctrl = L.DomUtil.create('div','leaflet-control-download leaflet-bar'),
				a = L.DomUtil.create('a','', ctrl);
			a.href = '#';
			a.target = '_blank';
			a.title = "Download simplified file";
			a.innerHTML = '<i class="fa fa-download"></i>';
			L.DomEvent
				.on(a, 'click', L.DomEvent.stop)
				.on(a, 'click', chooseDownloadFormat);			
			return ctrl;
		};
	return control;
}()).addTo(map);

//CONTROL VIEW
(function() {
	var control = new L.Control({position:'topleft'});
	control.onAdd = function(map) {
			var ctrl = L.DomUtil.create('div','leaflet-control-view leaflet-bar'),
				a = L.DomUtil.create('a','', ctrl);
			a.href = '#';
			a.target = '_blank';
			a.title = "View simplified file";
			a.innerHTML = '<i class="fa fa-eye"></i>';
			L.DomEvent
				.on(a, 'click', L.DomEvent.stop)
				.on(a, 'click', chooseViewFormat);			
			return ctrl;
		};
	return control;
}()).addTo(map);

//CONTROL ERASER
(function() {
	var control = new L.Control({position:'topleft'});
	control.onAdd = function(map) {
			var ctrl = L.DomUtil.create('div','leaflet-control-erase leaflet-bar'),
				a = L.DomUtil.create('a','', ctrl);
			a.href = '#';
			a.target = '_blank';
			a.title = "Clear the map";
			a.innerHTML = '<i class="fa fa-eraser"></i>';
			L.DomEvent
				.on(a, 'click', L.DomEvent.stop)
				.on(a, 'click', function(){
                    // FIXME Doesn't work if 2 files are uploaded in a row.
                    sourceLayer.eachLayer(function(layer)  {
                        map.removeLayer(layer);
                    });
                    simplifyLayer.clearLayers();
                });
			return ctrl;
		};
	return control;
}()).addTo(map);


//CONTROL NODES
(function() {
	var control = new L.Control({position:'bottomleft'});
	control.onAdd = function(map) {
			var ctrl = L.DomUtil.create('div','leaflet-control-stats');
			ctrl.id = 'stats';
			ctrl.innerHTML = 
				'<span id="nodes"></span><br />'+
				'<span id="filename"></span>';
			filename$ = $('#filename',ctrl);
			nodes$ = $('#nodes',ctrl);
			return ctrl;
		};
	return control;
}()).addTo(map);

//CONTROL SIDEBAR
//L.control.sidebar('sidebar',{position:'right', autoPan:false}).addTo(map).show();

L.control.attribution({
	position: 'topright',
	prefix: '<a href="http://leafletjs.com/">Leaflet</a> &bull; <a href="http://osm.org/" target="_blank">OpenStreetMap contributors</a>'
}).addTo(map);

// PRECISION SLIDER
$('#slider').slider({
	value: 0,
	min: 0,
	max: 0.1,
	step: 0.00005,
	precision: 8,
	tooltip: 'hide'
})
.on('slide', function(e) {
    window.currentLayer.optimize(e.value);
    window.currentLayer.display();
	//updateGeoJSON(e.value);
}).parent().width('100%');

$('#helpbtn').on('click',function(e) {
	$('#modal').modal('show');
});


//HELP POPUP
/*
var helpCount = $.cookie('tour');
if(!helpCount || parseInt(helpCount) < 3 )
{
	$('#modal').modal('show');
	helpCount = (parseInt(helpCount) || 0)+1;
	$.cookie('tour', helpCount, { expires: 120 });
}
*/
// LOADING FORMATS
var f = new Format();
f.loadAll(['GeoJSONFormat', 'GPXFormat', 'KMLFormat', 'MediawikiFormat']);

// LOADING SYNTAX HIGHLIGHTING
hljs.initHighlightingOnLoad();

});



