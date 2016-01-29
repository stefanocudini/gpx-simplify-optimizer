describe('filesizeHuman function', function() {

  it('filesizeHuman converts properly in fr', function() {
    $.i18n.init({lng:'fr' });
    expect(filesizeHuman(1000, 0)).toEqual('1000 octets');
    expect(filesizeHuman(2000, 0)).toEqual('2.0 ko');
    expect(filesizeHuman(20000, 0)).toEqual('19.5 ko');
    expect(filesizeHuman(100000, 0)).toEqual('97.7 ko');
    expect(filesizeHuman(500000, 0)).toEqual('488.3 ko');
    expect(filesizeHuman(3000000, 0)).toEqual('2.9 Mo');
  });

  it('filesizeHuman converts properly in en', function() {
    $.i18n.init({lng:'en' });
    expect(filesizeHuman(1000, 0)).toEqual('1000 Bytes');
    expect(filesizeHuman(2000, 0)).toEqual('2.0 kB');
    expect(filesizeHuman(20000, 0)).toEqual('19.5 kB');
    expect(filesizeHuman(100000, 0)).toEqual('97.7 kB');
    expect(filesizeHuman(500000, 0)).toEqual('488.3 kB');
    expect(filesizeHuman(3000000, 0)).toEqual('2.9 MB');
  });

  it('filesizeHuman converts properly in it', function() {
    $.i18n.init({lng:'it' });
    expect(filesizeHuman(1000, 0)).toEqual('1000 Bytes');
    expect(filesizeHuman(2000, 0)).toEqual('2.0 kB');
    expect(filesizeHuman(20000, 0)).toEqual('19.5 kB');
    expect(filesizeHuman(100000, 0)).toEqual('97.7 kB');
    expect(filesizeHuman(500000, 0)).toEqual('488.3 kB');
    expect(filesizeHuman(3000000, 0)).toEqual('2.9 MB');
  });
});

/*
var jsonify=function(o){
    var seen=[];
    var jso=JSON.stringify(o, function(k,v){
        if (typeof v =='object') {
            if ( !seen.indexOf(v) ) { return '__cycle__'; }
            seen.push(v);
        } return v;
    });
    return jso;
};
*/

describe("Testing fixtures conversion", function() {
    jasmine.getFixtures().fixturesPath = 'tests/fixtures';
    jasmine.getJSONFixtures().fixturesPath = 'tests/fixtures';

    $(document.body).append('<div id="map"></div>');
    window.map = L.map('map');
    window.map.hasLayer = function() { return true; }

    describe('Checking fixture 1', function() {
        checkFormatFixture('testcase1-classic-geojson.json');
    });
    describe('Checking fixture 2', function() {
        checkFormatFixture('testcase2-empty-geojson.json');
    });
    describe('Checking fixture 3', function() {
        checkFormatFixture('testcase3-multitracks-kml-novascotia.json');
    });
});

function checkFormatFixture(file) {
  var fixture = getJSONFixture(file);
  var kml = new KMLFormat();
  var gpx = new GPXFormat();
  var geojson = new GeoJSONFormat();
  var mediawiki = new MediawikiFormat();



  //window.formats = { "formats": {'length': 0} };
  //Layer.optimize(0);
  var Layer = new LayerOptimizer({layer: convertToGeoJSON(fixture.source)});
  var counters = Layer.countTracksNodes();


  it('Converts GeoJSON to GPX properly', function() {
    checkExportFormat(gpx, Layer, fixture.gpx);
  });

  it('Converts GeoJSON to GPX with correct estimated size', function() {
    checkSizePrecision(gpx, fixture.gpx, counters);
  });
  it('Converts GeoJSON to Mediawiki properly', function() {
    checkExportFormat(mediawiki, Layer, fixture.mediawiki);
  });

  it('Converts GeoJSON to Mediawiki with correct estimated size', function() {
    checkSizePrecision(mediawiki, fixture.mediawiki, counters);
  });
  it('Converts GeoJSON to KML properly', function() {
    checkExportFormat(kml, Layer, fixture.kml);
  });

  it('Converts GeoJSON to KML with correct estimated size', function() {
    checkSizePrecision(kml, fixture.kml, counters);
  });
  it('Converts GeoJSON to GeoJSON properly', function() {
    checkExportFormat(geojson, Layer, fixture.geojson);
  });

  it('Converts GeoJSON to GeoJSON with correct estimated size', function() {
    checkSizePrecision(geojson, fixture.geojson, counters);
  });
}

/**
 * Checks that the format estimated size the close to the real export size
 * 
 * @param format the export format
 * @param data the generated data
 */
function checkSizePrecision(format, data, counters) {
  var estimatedSize = format.getEstimatedSize(counters.tracks, counters.nodes);
  var precision = 15/100; // 15 percent
  // Debug in case size is not precise enough
  //console.log((data.length*(1-precision)-1) + " < " + estimatedSize + " < " + (data.length*(1+precision)+1) + " ----------- REAL : "+ data.length+"-----  percent : "+Math.abs(estimatedSize/data.length));
  expect(data.length*(1+precision)+1).toBeGreaterThan(estimatedSize);
  expect(data.length*(1-precision)-1).toBeLessThan(estimatedSize);
}

/**
 * Checks that the exported data is as expected
 * 
 * @param format the export format
 * @param data the generated data
 */
function checkExportFormat(format, Layer, data) {
  expect(format.groupData(Layer)).toEqual(data);
}


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
function convertToGeoJSON(content) {
    // Format is either 'gpx' or 'kml'
    if (typeof content == 'string') {
        var format = content.match(/<gpx/i) ? 'gpx' : content.match(/kml/i) ? 'kml' : 'geojson';
        content = ( new window.DOMParser() ).parseFromString(content, "text/xml");
        content = toGeoJSON[format](content);
    }
    return this.loadGeoJSON(content);
}
