/**
 * Class GPXFormat
 *
 * @require togpx method from https://github.com/tyrasd/togpx
 * @inherit Format
 */
function GPXFormat() {
    this.param = {
        'key': 'gpx',
        'syntax': 'xml',
        'name': 'GPX',
        'extension': 'gpx',
        'contenttype': 'application/gpx+xml',
        'size_header': 186,
        'size_track': 75,
        'size_node': 37
    }
    this.exportData = function(data) {
        return togpx(data);
    }
    this.display = function(data) {
        return prettyData.xml(data);
    }
}
GPXFormat.prototype = new Format();

