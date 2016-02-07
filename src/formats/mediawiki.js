/**
 * Class MediawikiFormat
 *
 * @see http://www.mediawiki.org/wiki/Extension:Maps
 * @require geojsonToPath method from https://github.com/Wilkins/geojson-to-path
 * @inherit Format
 */
function MediawikiFormat() {
    this.param = {
        'key': 'mediawiki',
        'syntax': 'nohighlight',
        'name': 'Mediawiki',
        'extension': 'txt',
        'contenttype': 'text/plain',
        'size_header': 0,
        'size_header_options': 0,
        'size_track': 0,
        'size_track_options': 0,
        'size_node': 17,
        'size_node_options': 0
    }
    this.exportData = function(data, layer) {
        return geojsonToPath(data);
    }
}
MediawikiFormat.prototype = new Format();


