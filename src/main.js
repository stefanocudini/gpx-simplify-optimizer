$(function() {

// CREATE MAP
var map = new L.Map('map', {
    zoomControl: false,
    attributionControl: false
})
.setView(L.latLng(36,-30),20)
.on('click', hideAll);

window.map = map;

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);


// List of LayerOptimizer objects
window.Layers = {};

// The current LayerOptimizer object
window.currentLayer = null;


// Zoom control to customize buttons titles
L.control.zoom({
    zoomInTitle:  $.t('actions.zoomin'),
    zoomOutTitle: $.t('actions.zoomout')
}).addTo(map);


//CONTROL UPLOAD
L.Control.FileLayerLoad.LABEL = '<i class="fa fa-folder-open"></i>';
L.Control.FileLayerLoad.TITLE= $.t('actions.upload');
var controlLoader = L.Control.fileLayerLoad({
	addToMap: false,
	fitBounds: false,
	fileSizeLimit: 8096,
    // Override the gpx parser
    parsers: {
        'gpx' : gpxParser
    },
    binaryFormats: []

}).addTo(map);

GPX_RAW_DATA = {};
console.log(GPX_RAW_DATA);

function gpxParser(content, format) {

    console.log('Nouveau parser gpx');
    var parsedGPX = null;
    gpxParse.parseGpx(content, function(error, data) {
        //console.log(content);
        if (error) {
            console.log("This GPX file has no tracks. Can not load as true GPX file. Using it as JSON");
            console.log(error);
            parsedGPX = JSON.parse(content);
        } else {
            console.log('Lecture data GPX ok : '+data.tracks.length);
            //tracks = data.tracks
            for (trackNum = 0; trackNum<data.tracks.length; trackNum++) {
                var track = data.tracks[trackNum];
                //console.log(track);
                for (segmentNum = 0; segmentNum<track.segments.length; segmentNum++) {
                    var segment = track.segments[segmentNum];
                    //console.log(segment);
                    for (pointNum = 0; pointNum<segment.length; pointNum++) {
                        var point = segment[pointNum];
                        GPX_RAW_DATA[point.lat+','+point.lon] = point;
                        //console.log(point);
                    }
                }

            }
            console.log(GPX_RAW_DATA);
            //console.log();
            /*
            foreach (data as item) {
                GPX_RAW_DATA[data.latitude + ':' + data.longitude] = {
                    'time': time,
                    'duration': duration
                };
            }
            */
            parsedGPX = convertToGeoJSON(content);
            console.log(parsedGPX);
            /*
            return content;
            */

        }
        //return L.Control.fileLayerLoad.loader._convertToGeoJSON(content, format);
    });
    console.log(parsedGPX);
    return L.geoJson(parsedGPX);
/*
    console.log('Fin');
    console.log('format: '+format);
*/

}

// Got it from https://github.com/makinacorpus/Leaflet.FileLayer/blob/gh-pages/leaflet.filelayer.js
function loadGeoJSON(content) {
    if (typeof content == 'string') {
        content = JSON.parse(content);
    }
    var layer = L.geoJson(content);
    if (layer.getLayers().length === 0) {
        throw new Error('GeoJSON has no valid layers.');
    }
    return layer;
}
function convertToGeoJSON(content) {
    // Format is either 'gpx' or 'kml'
    if (typeof content == 'string') {
        var format = content.match(/<gpx/i) ? 'gpx' : content.match(/kml/i) ? 'kml' : 'geojson';
        content = ( new window.DOMParser() ).parseFromString(content, "text/xml");
        content = toGeoJSON[format](content);
    }
    return content;
}


// UPLOAD ACTION
controlLoader.loader.on('data:loaded', function (layerObject) {
    hideAll();
    if (window.currentLayer) {
        window.currentLayer.removeController();
    }
    var layer = new LayerOptimizer(layerObject);
    layer.choose();
    window.Layers[layer.id] = layer;
    window.currentLayer = layer;
    updateLayers();

    /*
	$('.grumble, .grumble-text, .grumble-button').remove();
	$(document).unbind('keyup.crumble');
    */
})
.on('data:error', function (e) {
	console.log('ERROR',e.error);
});


//CONTROL DOWNLOAD
(function() {
	var control = new L.Control({position:'topleft'});
    control.onAdd = function(map) {
        var ctrl = L.DomUtil.create('div','leaflet-control-download leaflet-bar'),
            a = L.DomUtil.create('a','', ctrl);
        a.href = '#';
        a.target = '_blank';
        a.title = $.t('actions.download');
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
        a.title = $.t('actions.view');
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
        a.title = $.t('actions.clear');
        a.innerHTML = '<i class="fa fa-eraser"></i>';
        L.DomEvent
            .on(a, 'click', L.DomEvent.stop)
            .on(a, 'click', clearMap)
            .on(a, 'click', hideAll);
        return ctrl;
    };
	return control;
}()).addTo(map);


//CONTROL LANGUAGES
(function() {
	var control = new L.Control({position:'topleft'});
	control.onAdd = function(map) {
        var ctrl = L.DomUtil.create('div','leaflet-control-lang leaflet-bar'),
            a = L.DomUtil.create('a','', ctrl);
        a.href = '#';
        a.target = '_blank';
        a.title = $.t('actions.lang');
        $(a).addClass('first');
        a.innerHTML = '<i class="fa fa-flag"></i>';
        L.DomEvent
            .on(a, 'click', L.DomEvent.stop)
            .on(a, 'click', showLanguage);
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
				'<span id="filename"></span><br />'+
				'<span id="nodes"></span>';
			filename$ = $('#filename', ctrl);
			nodes$ = $('#nodes', ctrl);
			return ctrl;
		};
	return control;
}()).addTo(map);


//CONTROL SIDEBAR
//L.control.sidebar('sidebar',{position:'right', autoPan:false}).addTo(map).show();

// LOADING LANGUAGES
initLanguage();


L.control.attribution({
	position: 'topright',
	prefix: '<a href="http://leafletjs.com/">Leaflet</a> &bull; <a href="http://osm.org/" target="_blank" data-i18n="osm.contributors">'+$.t('osm.contributors')+'</a>'
}).addTo(map);


//CONTROL LAYER SWITCHER
(function() {
	var control = new L.Control({position:'topright'});
	control.onAdd = function(map) {
        var ctrl = L.DomUtil.create('div','leaflet-control-switcher-box leaflet-bar'),
        
            a = L.DomUtil.create('label','', ctrl);
        a.href = '#';
        a.title = $.t('actions.switchlayer');
        a.innerHTML = $.t('layers.switcher');
        var select = L.DomUtil.create('select','leaflet-control-switcher leaflet-bar', ctrl);
        L.DomEvent.on(select, 'change', function() {
            window.currentLayer.removeController();
            window.currentLayer = window.Layers[$(this).val()];
            window.currentLayer.choose();
            
        });
        return ctrl;
    };
	return control;
}()).addTo(map);


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
    window.currentLayer.displayInfos();
}).parent().width('100%');

$('#helpbtn').on('click',function(e) {
	e.preventDefault();
	$('#modal').modal('show');
});


//HELP POPUP
var helpCount = $.cookie('tour');
if(!helpCount || parseInt(helpCount) < 3 )
{
	$('#modal').modal('show');
	helpCount = (parseInt(helpCount) || 0)+1;
	$.cookie('tour', helpCount, { expires: 120 });
}
/*
*/


// LOADING FORMATS
var formats = new Format();
window.formats = formats;
formats.loadAll(['GeoJSONFormat', 'GPXFormat', 'KMLFormat', 'MediawikiFormat']);

// LOADING SYNTAX HIGHLIGHTING
hljs.initHighlightingOnLoad();

});

