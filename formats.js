/**
 * Convert a byte number in human readable format
 * 
 * @param integer bytes   the number of bytes
 * @param integer decimal the precision wanted
 *
 * @return the human readable size
 */
function filesizeHuman(bytes, decimal) {
	if (bytes === 0) return bytes;		
	decimal = decimal || 1;
	var sizes = ['Bytes','KB','MB','GB','TB'],
		i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	return (bytes / Math.pow(1024, i)).toFixed(decimal) + ' ' + sizes[i];
}

/**
 * Convert the number of nodes in a path in estimated export file size
 *
 * @param integer nodes the number of nodes
 *
 * @return the human readable file size
 */
function nodes2Bytes(nodes) {
	return filesizeHuman(400 + (nodes * 56));
}

/**
 * Get the absolute position of the given element
 *
 * @param Node element the element for which we want the position
 *
 * @see http://www.kirupa.com/html5/getting_mouse_click_position.htm
 * @return a new object with x/y
 */
function getPosition(element) {
    var xPosition = 0;
    var yPosition = 0;
      
    while (element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }
    return { x: xPosition, y: yPosition };
}

/**
 * Hide all format popup
 *
 * @return void
 */
function hideFormats() {
    $('#download-formats').hide();
    $('#view-formats').hide();
}

/**
 * Show popup for choosing download format
 * 
 * @param Event e the click event
 *
 * @return void
 */
function chooseDownloadFormat(e) {
    var position = getPosition(e.currentTarget);
    $('#download-formats').css('top', position.y-4);

    $('#download-formats').show();
    $('#view-formats').hide();
}

/**
 * Show popup for choosing view format
 * 
 * @param Event e the click event
 *
 * @return void
 */
function chooseViewFormat(e) {
    var position = getPosition(e.currentTarget);
    $('#view-formats').css('top', position.y-4);
    $('#view-formats').show();
    $('#download-formats').hide();
}
$('#export-close').on('click', function () {
    $('#export-format').hide();
});



/**
 * Class Format
 *
 * Root format for exporting simplified data
 */
var Format = function() {
    this.param = {'key':'format', 'name':'RootFormat'};
}

Format.prototype = {

    /**
     * Load all given formats
     *
     * @param Array formats the list of formats ClassNames
     * 
     * @return void
     */
    loadAll: function(formats) {
        formats.forEach(function(formatName) {
            eval("f = new "+formatName+"();");
            f.load();
        });
    },
    
    /**
     * Load the current format and create the link in download/view lists
     *
     * @return void
     */
    load: function() {
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

    /**
     * Save the data in the current format
     *
     * @param blob    data  the geojson data
     * @param string  name  the name of the file
     * @param integer nodes the number of nodes in the data
     *
     * @return void
     */
    save: function(data, name, nodes) {
        name = name.replace(/\..*/, "");
        name = name+'_'+nodes+'nodes.'+this.param.extension;
        try {
            if(!!new Blob())
            {
                var content = this.exportData(data);
                var blob = new Blob([content], {type: this.param.contenttype+";charset=utf-8"});
                saveAs(blob, name);
            }
        } catch (e) {
            alert('Please upload GPX/GeoJSON/KML file first, using Chrome or Firefox: ' + e.message);
            console.log(e.message);
            return false;
        }
        hideFormats();
    },

    /**
     * Action method when clicking on the Download format
     *
     * Uses the global variables simplify* to give to the save() method.
     *
     * @return void
     */
    saveClick: function() {
        this.save(window.simplifyLayerData, window.simplifyLayerName, window.simplifyNodes);
    },

    /**
     * View the data in a popup
     *
     * @param blob    data  the geojson data
     *
     * @return void
     */
    view: function(data) {
        try {
            if(!!new Blob())
            {
                var content = this.exportData(data);
                $('#export-content').val(content);
                $('#export-format h5').html('Simplified geometry in '+this.param.name+' format');
                $('#export-format').show();
            }
        } catch (e) {
            alert('Please upload GPX/GeoJSON/KML file first, using Chrome or Firefox: ' + e.message);
            console.log(e.message);
            return false;
        }
        hideFormats();
    },

    /**
     * Action method when clicking on the View format
     *
     * Uses the global variables simplify* to give to the save() method.
     *
     * @return void
     */
    viewClick: function() {
        this.view(window.simplifyLayerData);
    }
};


