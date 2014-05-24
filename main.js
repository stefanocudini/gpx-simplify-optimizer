$(function() {

var map = new L.Map('map',{attributionControl: false}).setView(L.latLng(36,-30),3),
	style1 = {
		color: 'red',
		opacity: 0.7,
		fillOpacity: 0.7,
		weight: 6,
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
	simplifyLayerName = 'simplified.gpx',
	simplifyLayerData = null,
	simplifyLayer = L.geoJson(simplifyLayerData, { style: style2 }).addTo(map);

L.Control.FileLayerLoad.LABEL = '<i class="fa fa-folder-open"></i>';
var controlLoader = L.Control.fileLayerLoad({
	addToMap: true,
	fitBounds: true,
	fileSizeLimit: 4096,
	layerOptions: {
		style: style1,
		pointToLayer: function (data, latlng) {
			return L.circle(latlng, 10, {style: style1});
		}
	}
}).addTo(map);

function updateGeoJSON(tolerance) {
	console.log('updateGeoJSON', tolerance);
	simplifyLayer.clearLayers();
	if(sourceLayer)
	{
		var nodes = 0;
		sourceLayer.eachLayer(function(layer)  {
			var modified = layer.toGeoJSON();
			//console.log('eachLayer',modified);
			modified.geometry.coordinates = simplifyGeometry(modified.geometry.coordinates, tolerance);
			simplifyLayer.addData(modified);
			simplifyLayerData = modified;
			nodes += modified.geometry.coordinates.length; 
		});
		filename$.html(simplifyLayerName);
		nodes$.html(nodes+' nodes');
	}
}

function saveToFile() {
	try {
   		if(!!new Blob())
   		{
   			var gpx = togpx(simplifyLayerData);
			var blob = new Blob([gpx], {type: "text/plain;charset=utf-8"});
			saveAs(blob, simplifyLayerName);
   		}
	} catch (e) {
		alert('For download gpx file using Chrome or Firefox');
		return false;
	}
}

controlLoader.loader.on('data:loaded', function (e) {
	sourceLayer = e.layer;
	simplifyLayerName = e.filename.replace('.gpx','.min.gpx');
	updateGeoJSON(0);
})
.on('data:error', function (e) {
	console.log('ERROR',e);
});

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
				step: 0.00001,
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

	//facebook
	(function(d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) return;
	js = d.createElement(s); js.id = id;
	js.src = "//connect.facebook.net/it_IT/sdk.js#xfbml=1&appId=455565641219872&version=v2.0";
	fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));
	//google+1
	(function() {
	var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
	po.src = 'https://apis.google.com/js/plusone.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
	})();
	//twitter
	!function(d,s,id){
	var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}
	}(document, 'script', 'twitter-wjs');

	$('#tour').crumble({
		grumble: {
			showAfter: 200,
			distance: 20
		}
	});

});

