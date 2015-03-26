/**
 * Class KMLFormat
 *
 * @require tokml method from https://github.com/mapbox/tokml
 * @inherit Format
 */
function KMLFormat() {
    this.param = {
		'key': 'kml',
		'name': 'KML',
		'extension': 'kml',
		'contenttype': 'application/vnd.google-earth.kml+xml'
	}
    this.exportData = function(data) {
        return tokml(data);
    }
}
KMLFormat.prototype = new Format();

