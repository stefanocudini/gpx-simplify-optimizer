describe('filesizeHuman function', function() {
  /*
  var format;

  beforeEach(function() {
    format = new Format();
  });
  */

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


