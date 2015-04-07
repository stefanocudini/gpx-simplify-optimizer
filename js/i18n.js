$.i18n.init({
    //lng: 'en',
    ns: { namespaces: [ 'ns.special'], defaultNs: 'ns.special'},
    useLocalStorage: false,
    // We load in synchronous mode to be able to build the page with i18n text
    getAsync: false,
    debug: true
}, function(t) {
    $('#appname').text($.t('app.name'));

    //$('.nav').i18n();
    $('#export-format').i18n();
    //$('#btn').i18n();
    //$('#extendedAttr').i18n();
});

