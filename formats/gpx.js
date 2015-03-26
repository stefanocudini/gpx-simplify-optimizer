/**
 * Class GPXFormat
 *
 * @require togpx method from https://github.com/tyrasd/togpx
 * @inherit Format
 */
function GPXFormat() {
    this.param = {
        'key': 'gpx',
        'name': 'GPX',
        'extension': 'gpx',
        'contenttype': 'application/gpx+xml'
    }
    this.exportData = function(data) {
        return togpx(data);
    }
    this.display = function(data) {
        return prettyData.xml(data);
    }
}
GPXFormat.prototype = new Format();

