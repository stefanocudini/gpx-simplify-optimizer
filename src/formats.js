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
	var sizes = $.t('export.units').split(',');
		i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    // Don't put decimal in Bytes
    if (i === 0) {
        decimal = 0;
    }
	return (bytes / Math.pow(1024, i)).toFixed(decimal) + ' ' + sizes[i];
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
function hideAll() {
    $('.popup').each(function() {
        $(this).hide();
    });
    hideLanguages();
}


/**
 * Show popup for choosing download format
 * 
 * @param Event e the click event
 *
 * @return void
 */
function chooseDownloadFormat(e) {
    hideAll();
    var position = getPosition(e.currentTarget);
    $('#download-formats').css('top', position.y-4);

    $('#download-formats').show();
//    $('#view-formats').hide();
}

/**
 * Show popup for choosing view format
 * 
 * @param Event e the click event
 *
 * @return void
 */
function chooseViewFormat(e) {
    hideAll();
    var position = getPosition(e.currentTarget);
    $('#view-formats').css('top', position.y-4);
    $('#view-formats').show();
    $('#download-formats').hide();
}

// Closing button
$('#export-close').on('click', function () {
    $('#export-format').hide();
});


/*
// When clicking the view div, select all text to be able to copy it
$("#export-content").click(function() {
//    $("#export-content").selectText();
});
*/

/**
 * Class Format
 *
 * Root format for exporting simplified data
 */
var Format = function() {
    this.param = {'key':'format', 'name':'RootFormat'};
    this.formats = [];
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
        for (var i=0; i<formats.length; i++) {
            f = new window[formats[i]]();
            f.load();
            this.formats.push(f);
        }
    },
    
    /**
     * Load the current format and create the link in download/view lists
     *
     * @return void
     */
    load: function() {
        // View links
        var a = document.createElement('a');
        var linkText = document.createTextNode($.t('export.viewin', {'format': this.param.name}));
        a.appendChild(linkText);
        a.title = $.t('export.viewtitle', {'format': this.param.name});
        a.className = "view";
        $(a).on('click', this.viewClick.bind(this));
        $('#view-formats').append(a);

        // Download links
        a = document.createElement('a');
        linkText = document.createTextNode($.t('export.downloadin', {'format': this.param.name}));
        a.appendChild(linkText);
        a.title = $.t('export.downloadtitle', {'format': this.param.name});
        a.className = "download";
        $(a).on('click', this.saveClick.bind(this));
        $('#download-formats').append(a);
    },

    /**
     * Display the data nicely
     *
     * @param string data the data to display
     *
     * @return the pretty data
     */
    display: function(data) {
        return data;
    },

    /**
     * Calculate an estimated size of the file
     * 
     * @param integer nodes the number of nodes in the file
     *
     * @return the human readable file size
     */
    getSize: function(tracks, nodes) {
    	return filesizeHuman(this.param.size_header + (tracks * this.param.size_track) + (nodes * this.param.size_node));
    },

    /**
     * Group all the layers into a single geoJSON objet
     *
     * @param array datas the array of LayerGroup
     *
     * @return the data in the proper format
     */
    groupData: function(datas) {
        var groupLayer = L.geoJson(null);
        for (var i=0; i<datas.length; i++) {

            if (window.map.hasLayer(datas[i].getLayers()[0])) {
                groupLayer.addData(datas[i].getLayers()[0].toGeoJSON());
            }
        }
        return this.exportData(groupLayer.toGeoJSON());
    },

    /**
     * Save the data in the current format
     *
     * @param layer a LayerOptimizer object
     *
     * @return void
     */
    save: function(layer) {
        name = layer.name.replace(/\..*/, "");
        name = name+'_'+layer.simplifiedLayerNodes+'nodes.'+this.param.extension;
        try {
            if(!!new Blob())
            {
                var content = this.groupData(layer.simplifiedLayerData);
                var blob = new Blob([content], {type: this.param.contenttype+";charset=utf-8"});
                saveAs(blob, name);
            }
        } catch (e) {
            alert($.t('upload.none')+' ' + e.message);
            console.log(e.message);
        }
        hideAll();
    },

    /**
     * Action method when clicking on the Download format
     *
     * Uses the global variables simplify* to give to the save() method.
     *
     * @return void
     */
    saveClick: function() {
        this.save(window.currentLayer);
    },

    /**
     * View the data in a popup
     *
     * @param layer a LayerOptimizer object
     *
     * @return void
     */
    view: function(layer) {
        try {
            if(!!new Blob())
            {
                var content = this.groupData(layer.simplifiedLayerData)
                //var content = this.exportData(layer.simplifiedLayerData);
                content = this.display(content);

                $('code').attr('class', this.param.syntax);
                $('#export-content').text(content);
                // Fixing an arbitrary limit
                // If there is too many points, do not highlight, it's too heavy for the browser.
                if (layer.simplifiedLayerNodes < 1000) {
                    $('code').each(function(i, block) {
                        hljs.highlightBlock(block);
                    });
                }
                $('#export-format h5').html($.t('export.title', {'format': this.param.name}));
                $('#export-format').show();
            }
        } catch (e) {
            alert($.t('upload.none')+' ' + e.message);
            console.log(e.message);
        }
        hideAll();
    },

    /**
     * Action method when clicking on the View format
     *
     * Uses the global variables simplify* to give to the save() method.
     *
     * @return void
     */
    viewClick: function() {
        this.view(window.currentLayer);
    }
};

