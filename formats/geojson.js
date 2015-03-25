// Format GeoJSON
function GeoJSONFormat() {
	this.param = {
		'key': 'geojson',
		'name': 'GeoJSON',
		'extension': 'json',
		'contenttype': 'appplication/json'
	}
    this.exportData = function(data) {
        return JSON.stringify(data);
    }
};
GeoJSONFormat.prototype = new Format();


