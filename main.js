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

function filesizeHuman(bytes, decimal) {
	if (bytes === 0) return bytes;		
	decimal = decimal || 1;
	var sizes = ['Bytes','KB','MB','GB','TB'],
		i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	return Math.round(bytes / Math.pow(1024, i), decimal) + ' ' + sizes[i];
}

function nodes2Bytes(nodes) {
	return filesizeHuman(400 + (nodes * 56));
}

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
		nodes$.text(simplifyNodes+' nodes ~'+nodes2Bytes(simplifyNodes));
	}
}


$('.download-geojson').on('click', saveToFileGeoJSON);
$('.download-gpx').on('click', saveToFileGPX);
$('.download-path').on('click', saveToFilePath);
$('.view-geojson').on('click', viewGeoJSON);
$('.view-gpx').on('click', viewGPX);
$('.view-path').on('click', viewPath);
$('#export-close').on('click', function () {
	$('#export-format').hide();
});

function chooseDownloadFormat() {
	$('#download-formats').show();
	$('#view-formats').hide();
}
function chooseViewFormat() {
	$('#view-formats').show();
	$('#download-formats').hide();
}
function hideFormats() {
	$('#download-formats').hide();
	$('#view-formats').hide();
}

function exportToGPX() {
	return togpx(simplifyLayerData);
}

function exportToGeoJSON() {
	return JSON.stringify(simplifyLayerData);
}

function exportToPath() {
	return geojsonToPath(simplifyLayerData);
}

function saveToFile(content, type, extension) {
	try {
   		if(!!new Blob())
   		{
   			var gpx = exportToGPX();
			var blob = new Blob([content], {type: type+";charset=utf-8"});
			name = simplifyLayerName.replace(/\..*/, "");
			saveAs(blob, name+'_'+simplifyNodes+'nodes.'+extension);
   		}
	} catch (e) {
		alert('Please upload GPX/GeoJSON/KML file first, using Chrome or Firefox');
		return false;
	}
	hideFormats();
}

function saveToFileGeoJSON() {
	saveToFile(exportToGeoJSON(), "application/json", "json");
}

function saveToFileGPX() {
	saveToFile(exportToGPX(), "text/plain", "gpx");
}

function saveToFilePath() {
	saveToFile(exportToPath(), "text/plain", "txt");
}

function viewFile(content) {
	try {
   		if(!!new Blob())
   		{
			$('#export-content').val(content);
			$('#export-format').show();
   		}
	} catch (e) {
		alert('Please upload GPX/GeoJSON/KML file first, using Chrome or Firefox');
		return false;
	}
	hideFormats();
}

function viewPath() {
	viewFile(exportToPath());
}

function viewGPX() {
	viewFile(exportToGPX());
}

function viewGeoJSON() {
	viewFile(exportToGeoJSON());
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
			a.title = "Download simplified file";
			a.innerHTML = '<i class="fa fa-download"></i>';
			L.DomEvent
				.on(a, 'click', L.DomEvent.stop)
				//.on(a, 'click', saveToFile);			
				.on(a, 'click', chooseDownloadFormat);			
			return ctrl;
		};
	return control;
}()).addTo(map);

//CONTROL PATH
(function() {
	var control = new L.Control({position:'topleft'});
	control.onAdd = function(map) {
			var ctrl = L.DomUtil.create('div','leaflet-control-path leaflet-bar'),
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
	prefix: '<a href="http://leafletjs.com/">Leaflet</a> &bull; <a href="http://osm.org/" target="_blank">OpenStreetMap contributors</a>',
}).addTo(map);

$('#slider').slider({
	value: 0,
	min: 0,
	max: 0.1,
	step: 0.00005,
	precision: 8,
	tooltip: 'hide'
})
.on('slide', function(e) {
	updateGeoJSON(e.value);
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
});

