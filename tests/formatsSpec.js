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

describe("Testing fixtures conversion", function() {
    jasmine.getFixtures().fixturesPath = 'tests/fixtures';
    jasmine.getJSONFixtures().fixturesPath = 'tests/fixtures';

    $(document.body).append('<div id="map"></div>');
    window.map = L.map('map');
    window.map.hasLayer = function() { return true; }

    describe('Checking fixture 1 (optimization -1)', function() {
        checkFormatFixture('testcase1-classic-geojson-optimization-1.json');
    });
    describe('Checking fixture 1 (optimization 0)', function() {
        checkFormatFixture('testcase1-classic-geojson-optimization0.json');
    });
    describe('Checking fixture 1 (optimization 0.5)', function() {
        checkFormatFixture('testcase1-classic-geojson-optimization0.5.json');
    });

    describe('Checking fixture 2 (optimization -1)', function() {
        checkFormatFixture('testcase2-empty-geojson-optimization-1.json');
    });
    describe('Checking fixture 2 (optimization 0)', function() {
        checkFormatFixture('testcase2-empty-geojson-optimization0.json');
    });
    describe('Checking fixture 2 (optimization 0.5)', function() {
        checkFormatFixture('testcase2-empty-geojson-optimization0.5.json');
    });

    describe('Checking fixture 3 (optimization -1)', function() {
        checkFormatFixture('testcase3-multitracks-kml-novascotia-optimization-1.json');
    });
    describe('Checking fixture 3 (optimization 0)', function() {
        checkFormatFixture('testcase3-multitracks-kml-novascotia-optimization0.json');
    });
    describe('Checking fixture 3 (optimization 0.1)', function() {
        checkFormatFixture('testcase3-multitracks-kml-novascotia-optimization0.1.json');
    });

    describe('Checking fixture 4 (optimization -1)', function() {
        checkFormatFixture('testcase4-gpx-with-time-data-optimization-1.json', gpxParser);
    });
    describe('Checking fixture 4 (optimization 0)', function() {
        checkFormatFixture('testcase4-gpx-with-time-data-optimization0.json', gpxParser);
    });
    describe('Checking fixture 4 (optimization 0.5)', function() {
        checkFormatFixture('testcase4-gpx-with-time-data-optimization0.5.json', gpxParser);
    });
});

function checkFormatFixture(file, parser) {
  parser = parser || defaultParser;
  var fixture = getJSONFixture(file);
  var kml = new KMLFormat();
  var gpx = new GPXFormat();
  var geojson = new GeoJSONFormat();
  var mediawiki = new MediawikiFormat();

  window.formats = { "formats": {'length': 0} };
  var Layer = new LayerOptimizer({layer: parser(fixture.source)});

  if (fixture.optimization !== -1) {
    Layer.optimize(fixture.optimization);
  }
  var counters = Layer.countTracksNodes();

  it('Converts GeoJSON to GPX properly', function() {
    checkExportFormat(gpx, Layer, fixture.gpx);
  });
  it('Converts GeoJSON to GPX with correct estimated size', function() {
    checkSizePrecision(gpx, fixture.gpx, counters, Layer);
  });

  it('Converts GeoJSON to Mediawiki properly', function() {
    checkExportFormat(mediawiki, Layer, fixture.mediawiki);
  });
  it('Converts GeoJSON to Mediawiki with correct estimated size', function() {
    checkSizePrecision(mediawiki, fixture.mediawiki, counters, Layer);
  });

  it('Converts GeoJSON to KML properly', function() {
    checkExportFormat(kml, Layer, fixture.kml);
  });
  it('Converts GeoJSON to KML with correct estimated size', function() {
    checkSizePrecision(kml, fixture.kml, counters, Layer);
  });

  it('Converts GeoJSON to GeoJSON properly', function() {
    checkExportFormat(geojson, Layer, fixture.geojson);
  });
  it('Converts GeoJSON to GeoJSON with correct estimated size', function() {
    checkSizePrecision(geojson, fixture.geojson, counters, Layer);
  });
}

/**
 * Checks that the format estimated size the close to the real export size
 * 
 * @param format the export format
 * @param data the generated data
 */
function checkSizePrecision(format, data, counters, layer) {
  
  var estimatedSize = format.getEstimatedSize(counters.tracks, counters.nodes, layer.rawData);
  var precision = 20/100; // 15 percent
  // Debug in case size is not precise enough
  //console.log(" estimatedSize = header("+format.param.size_header+") + tracks("+counters.tracks+") * size_track("+ format.param.size_track+") + nodes("+counters.nodes+") * size_node("+ format.param.size_node+")");
  //console.log((data.length*(1-precision)-1) + " < " + data.length + " < " + (data.length*(1+precision)+1) + " ----------- Estimated : "+ estimatedSize +"-----  percent : "+Math.abs(estimatedSize/data.length));
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


