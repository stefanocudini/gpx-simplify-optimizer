//Format GPX
function GPXFormat() {
    this.param = {
		'key': 'gpx',
		'name': 'GPX',
		'extension': 'gpx',
		'contenttype': 'text/xml'
	}
    this.exportData = function(data) {
        return togpx(data);
    }
}
GPXFormat.prototype = new Format();
