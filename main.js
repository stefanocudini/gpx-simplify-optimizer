$(function() {

var map = new L.Map('map',{attributionControl: false}).setView(L.latLng(36,-30),3),
	style1 = {
		color: 'red',
		opacity: 0.7,
		fillOpacity: 0.7,
		weight: 5,
		clickable: false
	},
	style2 = {
		color: 'blue',
		opacity: 1.0,
		fillOpacity: 1.0,
		weight: 2,
		clickable: false
	};

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

var filename$,
	nodes$,
	sourceLayer = null,
	simplifyNodes = 0,
	simplifyLayerName = 'simplified.gpx',
	simplifyLayerData = null,
	simplifyLayer = L.geoJson(simplifyLayerData, { style: style2 }).addTo(map);

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

function updateGeoJSON(tolerance) {
	//console.log('updateGeoJSON', tolerance);
	if(sourceLayer)
	{
		simplifyLayer.clearLayers();
		simplifyNodes = 0;
		//sourceLayer.eachLayer(function(layer)  {
		layer = sourceLayer.getLayers()[0];

		//FIXME support multi tracks

			var modified = layer.toGeoJSON();
			//console.log('eachLayer',modified);
			modified.geometry.coordinates = simplifyGeometry(modified.geometry.coordinates, tolerance);
			simplifyLayer.addData(modified);
			simplifyLayerData = modified;
			simplifyNodes += modified.geometry.coordinates.length; 
		//});
		nodes$.text(simplifyNodes);
	}
}

function saveToFile() {
	try {
   		if(!!new Blob())
   		{
   			var gpx = togpx(simplifyLayerData);
			var blob = new Blob([gpx], {type: "text/plain;charset=utf-8"});
			saveAs(blob, simplifyLayerName+'_'+simplifyNodes+'nodes.gpx');
   		}
	} catch (e) {
		alert('For download gpx file using Chrome or Firefox');
		return false;
	}
}

controlLoader.loader.on('data:loaded', function (e) {
	sourceLayer = e.layer;
	map.fitBounds( sourceLayer.getBounds() );
	simplifyLayerName = e.filename;
	updateGeoJSON(0);
	filename$.html(simplifyLayerName);
	$('.grumble, .grumble-text, .grumble-button').remove();
	$(document).unbind('keyup.crumble');
})
.on('data:error', function (e) {
	console.log('ERROR',e);
});

//CONTROL DOWNLOAD
(function() {
	var control = new L.Control({position:'topleft'});
	control.onAdd = function(map) {
			var ctrl = L.DomUtil.create('div','leaflet-control-down leaflet-bar'),
				a = L.DomUtil.create('a','', ctrl);
			a.href = '#';
			a.target = '_blank';
			a.title = "Download simplified GPX file";
			a.innerHTML = '<i class="fa fa-download"></i>';
			L.DomEvent
				.on(a, 'click', L.DomEvent.stop)
				.on(a, 'click', saveToFile);			
			return ctrl;
		};
	return control;
}()).addTo(map);


//CONTROL SLIDER
(function() {
	var control = new L.Control({position:'bottomleft'});
	control.onAdd = function(map) {
			var ctrl = L.DomUtil.create('div','leaflet-control-slider'),
				input = L.DomUtil.create('input','input-slider', ctrl);
			input.type = 'text';

			var slider$ = $(input).slider({
				value: 0,
				min: 0,
				max: 0.002,
				step: 0.00005,
				precision: 8,
				tooltip: 'hide'
			})
			.on('slide', function(e) {
				e.preventDefault();
				e.stopPropagation();
				updateGeoJSON(e.value);
			})
			.on('slideStart', function(e) {
				e.preventDefault();
				e.stopPropagation();
			});

			L.DomEvent.disableClickPropagation(ctrl);

			slider$.parent().width(map.getSize().x-40);

			map.on('resize', function(e) {
				slider$.parent().width(e.newSize.x-40);
			})

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
				'<span id="nodes"></span> nodes<br />'+
				'<span id="filename"></span>';
			filename$ = $('#filename',ctrl);
			nodes$ = $('#nodes',ctrl);
			return ctrl;
		};
	return control;
}()).addTo(map);

//CONTROL SIDEBAR
L.control.sidebar('sidebar',{position:'right', autoPan:false}).addTo(map).show();

L.control.attribution({
	position: 'topright',
	prefix: '<a href="http://leafletjs.com/">Leaflet</a> &bull; <a href="http://osm.org/" target="_blank">OpenStreetMap contributors</a>',
}).addTo(map);

//HELP POPUP
var helpCount = $.cookie('tour');

if(!helpCount || parseInt(helpCount) < 3 )
{
	$('#modal').modal('show');
	helpCount = (parseInt(helpCount) || 0)+1;
	$.cookie('tour', helpCount, { expires: 120 });
	// $('#tour').crumble({
	// 	grumble: {
	// 		showAfter: 200,
	// 		distance: 20
	// 	},
	// 	onStep: function() {
	// 		$.cookie('tour', '1', { expires: 120 });
	// 	}
	// });	
}

});

