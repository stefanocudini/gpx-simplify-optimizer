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
        'size_header': 90,
        'size_header_options': 80,
        'size_track': 50,
        'size_track_options': 0,
        'size_node': 20,
        'size_node_options': 6
    }
    this.exportData = function(data, layer) {
        return JSON.stringify(data);
    }
    this.display = function(data) {
        return prettyData.json(data);
    }
}
GeoJSONFormat.prototype = new Format();


