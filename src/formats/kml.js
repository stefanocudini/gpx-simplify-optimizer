/**
 * Class KMLFormat
 *
 * @require tokml method from https://github.com/mapbox/tokml
 * @inherit Format
 */
function KMLFormat() {
    this.param = {
        'key': 'kml',
        'syntax': 'xml',
        'name': 'KML',
        'extension': 'kml',
        'contenttype': 'application/vnd.google-earth.kml+xml',
        'size_header': 150,
        'size_track': 81,
        'size_node': 19,
        'size_node_options': 6
    }
    this.exportData = function(data, layer) {
        return tokml(data);
    }
    this.display = function(data) {
        return prettyData.xml(data);
    }
}
KMLFormat.prototype = new Format();

