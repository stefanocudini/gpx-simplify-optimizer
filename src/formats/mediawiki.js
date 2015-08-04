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
        'size_track': 0,
        'size_node': 20
    }
    this.exportData = function(data) {
        return geojsonToPath(data);
    }
}
MediawikiFormat.prototype = new Format();


