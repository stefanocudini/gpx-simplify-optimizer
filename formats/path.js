/**
 * Class PathFormat
 *
 * @require geojsonToPath method from https://github.com/Wilkins/geojson-to-path
 * @inherit Format
 */
function PathFormat() {
    this.param = {
        'key': 'path',
        'syntax': 'nohighlight',
        'name': 'Path',
        'extension': 'txt',
        'contenttype': 'text/plain'
    }
    this.exportData = function(data) {
        return geojsonToPath(data);
    };
};
PathFormat.prototype = new Format();


