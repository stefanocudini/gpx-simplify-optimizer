/**
 * Class GeoJSONFormat
 *
 * @require JSON native object (ok in modern browsers)
 * @inherit Format
 */
function GeoJSONFormat() {
    this.param = {
        'key': 'geojson',
        'name': 'GeoJSON',
        'extension': 'geojson',
        'contenttype': 'appplication/json'
    }
    this.exportData = function(data) {
        return JSON.stringify(data);
    }
};
GeoJSONFormat.prototype = new Format();


