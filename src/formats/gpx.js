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
        'size_header_options': 30,
        'size_track': 105,
        'size_track_options': 0,
        'size_node': 48,
        'size_node_options': 54
    }

    this.exportData = function(data, layer) {

        // Here we find the right time for the right coordinates to put it in a "times" array.
        // This will be read by the jwenzler/togpx fork
        if (data.features && data.features[0].geometry) {
            data.features[0].geometry.times = [];
            for (var coord in data.features[0].geometry.coordinates) {
                var coordString = data.features[0].geometry.coordinates[coord][1] + "," + data.features[0].geometry.coordinates[coord][0];
                if (layer.rawData[coordString] && layer.rawData[coordString].time) {
                    data.features[0].geometry.times.push(layer.rawData[coordString].time); //.toISOString());

                } else {
                    data.features[0].geometry.times.push(undefined);
                }

            }

        }

        var string = togpx(data);
        return string;
    }
    this.display = function(data) {
        return prettyData.xml(data);
    }
}
GPXFormat.prototype = new Format();

RAW_DATA = {};

function gpxParser(content, format) {

    //console.log('Nouveau parser gpx');
    var parsedGPX = null;
    gpxParse.parseGpx(content, function(error, data) {
        if (error) {
            // This case happens when the GPX file has no tracks, but may contains a route.
            // In this case, when read it like the Leaflet.Filelayer plugin
            console.log("This GPX file has no tracks. It may be a route... Can not load as true GPX file.");
            parsedGPX = convertToGeoJSON(content);
        } else {
            //console.log('Lecture data GPX ok : '+data.tracks.length);
            for (trackNum = 0; trackNum<data.tracks.length; trackNum++) {
                var track = data.tracks[trackNum];
                for (segmentNum = 0; segmentNum<track.segments.length; segmentNum++) {
                    var segment = track.segments[segmentNum];
                    for (pointNum = 0; pointNum<segment.length; pointNum++) {
                        var point = segment[pointNum];
                        RAW_DATA[point.lat+','+point.lon] = point;
                    }
                }

            }
            parsedGPX = convertToGeoJSON(content);
        }
    });

    return L.geoJson(parsedGPX);
}
