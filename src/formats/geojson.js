/**
 * Class GeoJSONFormat
 *
 * @require JSON native object (ok in modern browsers)
 * @inherit Format
 */
function GeoJSONFormat() {
    this.param = {
        'key': 'geojson',
        'syntax': 'json',
        'name': 'GeoJSON',
        'extension': 'geojson',
        'contenttype': 'appplication/json',
        'size_header': 45,
        'size_track': 110,
        'size_node': 22
    }
    this.exportData = function(data) {
        return JSON.stringify(data);
    }
    this.display = function(data) {
        return prettyData.json(data);
    }
}
GeoJSONFormat.prototype = new Format();


