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



// Got it from https://github.com/makinacorpus/Leaflet.FileLayer/blob/gh-pages/leaflet.filelayer.js
function loadGeoJSON(content) {
    if (typeof content == 'string') {
        content = JSON.parse(content);
    }
    var layer = L.geoJson(content);
    if (layer.getLayers().length === 0) {
        throw new Error('GeoJSON has no valid layers.');
    }
    return layer;
}

// Got it from https://github.com/makinacorpus/Leaflet.FileLayer/blob/gh-pages/leaflet.filelayer.js
function convertToGeoJSON(content) {
    // Format is either 'gpx' or 'kml'
    if (typeof content == 'string') {
        var format = content.match(/<gpx/i) ? 'gpx' : content.match(/kml/i) ? 'kml' : 'geojson';
        content = ( new window.DOMParser() ).parseFromString(content, "text/xml");
        content = toGeoJSON[format](content);
    }
    return content;
}

function defaultParser(content) {
    return loadGeoJSON(convertToGeoJSON(content));
}


// Source stackoverflow
function jsonify(o) {
    var seen=[];
    var jso=JSON.stringify(o, function(k,v){
        if (typeof v =='object') {
            if ( !seen.indexOf(v) ) { return '__cycle__'; }
            seen.push(v);
        } return v;
    });
    return jso;
}



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
     * Calculate an estimated size of the file in a readable format
     * 
     * @param integer tracks the number of tracks in the file
     * @param integer nodes the number of nodes in the file
     *
     * @return the human readable file size
     */
    getSize: function(tracks, nodes, rawData) {
    	return filesizeHuman(this.getEstimatedSize(tracks, nodes, rawData));
    },

    /**
     * Calculate an estimated size of the file
     * 
     * @param integer tracks the number of tracks in the file
     * @param integer nodes the number of nodes in the file
     *
     * @return the numeric file size
     */
    getEstimatedSize: function(tracks, nodes, rawData) {
        var rawSize = 0;
        if (Object.keys(rawData).length) {
            rawSize = nodes * this.param.size_node_options;
            rawSize += this.param.size_header_options;
            rawSize += tracks * this.param.size_track_options;
        }
    	return this.param.size_header + (tracks * this.param.size_track) + (nodes * this.param.size_node) + rawSize;
    },

    /**
     * Group all the layers into a single geoJSON objet
     *
     * @param object layer the LayerOptimizer object
     *
     * @return the data in the proper format
     */
    groupData: function(layer) {
        var datas = layer.simplifiedLayerData;
        var groupLayer = L.geoJson(null);
        var data;
        for (var i=0; i<datas.length; i++) {

            if (window.map.hasLayer(datas[i].getLayers()[0])) {
                data = datas[i].getLayers()[0].toGeoJSON();
                // Hack to handle issue #12
                // If geometry was not a LineString, we converted it to LineString to be able to simplify it.
                // Now have to put it back to its original geometry
                // But if we do, we get an Error: Invalid LatLng object: (NaN, NaN)
                // when calling L.geoJson.addData()
                // From http://cdn.leafletjs.com/leaflet-0.7/leaflet-src.js:1163
                /*
                if (layer.sourceLayerOptions[i].type) {
                    data.geometry.type = layer.sourceLayerOptions[i].type;
                }
                */

                groupLayer.addData(data);
            }
        }
        return this.exportData(groupLayer.toGeoJSON(), layer);
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
                var content = this.groupData(layer);
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
                var content = this.groupData(layer)
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
