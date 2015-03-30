// @see http://cwestblog.com/2012/11/12/javascript-degree-and-radian-conversion/

// Converts from degrees to radians.
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

function chooseAirports(e) {

    hideAll();
    var position = getPosition(e.currentTarget);
    $('.planes').css('top', position.y-4);
    $('.planes').show();


}


function distance(lat1, lon1, lat2, lon2) {
    return 2*Math.asin(Math.sqrt(Math.pow(Math.sin((lat1-lat2)/2), 2) + Math.cos(lat1)*Math.cos(lat2)*Math.pow(Math.sin((lon1-lon2)/2),2)));

}

function pathFraction(pos1, pos2, fraction) {
    //fraction = 0.5;
    var lat1 = Math.radians(pos1.split(',')[0]);
    var lon1 = Math.radians(pos1.split(',')[1]);
    var lat2 = Math.radians(pos2.split(',')[0]);
    var lon2 = Math.radians(pos2.split(',')[1]);
    
    var d = distance(lat1, lon1, lat2, lon2);
    var A = Math.sin((1-fraction)*d)/Math.sin(d);
    var B = Math.sin(fraction*d)/Math.sin(d);
    var x = A*Math.cos(lat1)*Math.cos(lon1) + B*Math.cos(lat2)*Math.cos(lon2);
    var y = A*Math.cos(lat1)*Math.sin(lon1) + B*Math.cos(lat2)*Math.sin(lon2);
    var z = A*Math.sin(lat1)                + B*Math.sin(lat2);
    var lat = Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
    var lon = Math.atan2(y, x);

    return [Math.degrees(lon), Math.degrees(lat)];
}

function traceFlightPrecision(pos1, pos2, precision) {
    var coordinates = [];
    coordinates.push(pos1.split(",").reverse());
    //var str = pos1;
    var p = 1 / precision;
    for (var i=0; i<1; i+=p) {
        coordinates.push(pathFraction(pos1, pos2, i));
    }
    coordinates.push(pos2.split(",").reverse());
    return { "type": "Feature", "properties": {}, "geometry": { "type": "LineString", "coordinates": coordinates }};

}

function traceFlight() {
    //alert($('#fromval').val());
    if ($('#fromval').val() && $('#toval').val()) {

        window.simplifyLayerData = traceFlightPrecision($('#fromval').val(), $('#toval').val(), 100);
    	window.simplifyLayer = L.geoJson(window.simplifyLayerData, { style : window.style2 }).addTo(window.map);
        window.layers[$('#from').val()+' -> '+$('#to').val()] = window.simplifyLayerData;

    }

}


$(document).ready(function() {

    $('.autocomplete').autocomplete({
        serviceUrl: 'http://wilkins.fr/airports/iata.php',
        onSelect: function (suggestion) {
            $(('#'+this.id+'val')).val(suggestion.data);
            traceFlight();
        }
    });
});

