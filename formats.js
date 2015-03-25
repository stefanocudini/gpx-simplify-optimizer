function hideFormats() {
	$('#download-formats').hide();
	$('#view-formats').hide();
}
function chooseDownloadFormat() {
	$('#download-formats').show();
	$('#view-formats').hide();
}
function chooseViewFormat() {
	$('#view-formats').show();
	$('#download-formats').hide();
}
$('#export-close').on('click', function () {
	$('#export-format').hide();
});

// Root Format
var Format = function() {
    this.param = {'key':'format', 'name':'RootFormat'};
    this.formats = [
        'GeoJSONFormat',
        'GPXFormat',
        'PathFormat'
    ];
}

Format.prototype = {

    loadAll: function(data) {
        var f;
        this.formats.forEach(function(formatName) {
            eval("f = new "+formatName+"();");
            f.load();
        });
    },
    
    load: function(data) {
        // View links
        var a = document.createElement('a');
        var linkText = document.createTextNode("View in "+this.param.name);
        a.appendChild(linkText);
        a.title = "View the simplified data in "+this.param.name;
        a.className = "view";
        $(a).on('click', this.viewClick.bind(this));
        $('#view-formats').append(a);

        // Download links
        var a = document.createElement('a');
        var linkText = document.createTextNode("Download in "+this.param.name);
        a.appendChild(linkText);
        a.title = "Download the simplified data in "+this.param.name;
        a.className = "download";
        $(a).on('click', this.saveClick.bind(this));
        $('#download-formats').append(a);
    },

    save: function(data, name, nodes) {
        name = name.replace(/\..*/, "");
        //alert(JSON.stringify(this.param));
        //alert(JSON.stringify(this.param));
        name = name+'_'+nodes+'nodes.'+this.param.extension;
        //saveFile(this.exportData(data), name, this.param.contenttype);
        var content = this.exportData(data);
        try {
            if(!!new Blob())
            {
                var blob = new Blob([content], {type: this.param.contenttype+";charset=utf-8"});
                saveAs(blob, name);
            }
        } catch (e) {
            alert('Please upload GPX/GeoJSON/KML file first, using Chrome or Firefox :' + e.message);
            console.log(e.message);
            return false;
        }
        hideFormats();
    },

    saveClick: function() {
        this.save(window.simplifyLayerData, window.simplifyLayerName, window.simplifyNodes);
    },

    view: function(data) {
        //viewFile(this.exportData(data));
        var content = this.exportData(data);
        try {
            if(!!new Blob())
            {
                $('#export-content').val(content);
                $('#export-format').show();
            }
        } catch (e) {
            alert('Please upload GPX/GeoJSON/KML file first, using Chrome or Firefox :' + e.message);
            console.log(e.message);
            return false;
        }
        hideFormats();
    },

    viewClick: function() {
        this.view(window.simplifyLayerData);
    }
};


