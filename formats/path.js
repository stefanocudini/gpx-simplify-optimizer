// Format Path
function PathFormat() {
	this.param = {
		'key': 'path',
		'name': 'Path',
		'extension': 'txt',
		'contenttype': 'text/plain'
	}
    this.exportData = function(data) {
        return geojsonToPath(data);
    };
};
PathFormat.prototype = new Format();


