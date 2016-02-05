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
        'size_header': 130,
        'size_header_options': 120,
        'size_track': 120,
        'size_track_options': 0,
        'size_node': 21,
        'size_node_options': 5
    }
    this.exportData = function(data, layer) {
        return tokml(data);
    }
    this.display = function(data) {
        return prettyData.xml(data);
    }
}
KMLFormat.prototype = new Format();

