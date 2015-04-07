/**
 * Allow to select all text from the element
 * 
 * @see http://stackoverflow.com/questions/12243898/how-to-select-all-text-in-contenteditable-div
 */
/*
Replaced with contenteditable="true" for now
jQuery.fn.selectText = function(){
   var doc = document;
   var element = this[0];
   console.log(this, element);
   if (doc.body.createTextRange) {
       var range = document.body.createTextRange();
       range.moveToElementText(element);
       range.select();
   } else if (window.getSelection) {
       var selection = window.getSelection();        
       var range = document.createRange();
       range.selectNodeContents(element);
       selection.removeAllRanges();
       selection.addRange(range);
   }
};
*/
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
function hideAll() {
    $('.popup').each(function() {
        $(this).hide();
    });
    //$('#download-formats').hide();
    //$('#view-formats').hide();
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
            f = new window[formatName]();
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
                var content = this.exportData(layer.simplifiedLayerData);
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
                var content = this.exportData(layer.simplifiedLayerData);
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


