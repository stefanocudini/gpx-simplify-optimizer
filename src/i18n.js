$.i18n.init({
    //lng: 'en',
    ns: { namespaces: [ 'ns.special'], defaultNs: 'ns.special'},
    useLocalStorage: false,
    // We load in synchronous mode to be able to build the page with i18n text
    getAsync: false,
    fallbackLng: 'en',
    debug: false
}, function(t) {
    $('body').i18n();
});


/**
 * The available languages
 */
window.languages = {
    'En' : 'English',
    'It' : 'Italiano',
    'Fr' : 'Français'
}

/**
 * Hide the language selector
 */
function hideLanguages() {
    $('.leaflet-control-lang a.lang').each(function() {
        $(this).hide();
    });
}

/**
 * Switch to selected langage
 */
function switchLanguage() {
    hideLanguages();
    window.location.href='?setLng='+$(this).attr('data-lang').toLowerCase();
}

/**
 * Initialize the languages selector
 */
function initLanguage() {
    var flagdiv = $('.leaflet-control-lang').get(0);
    var a;
    for (var lang in window.languages) {
        a = L.DomUtil.create('a', '', flagdiv);
        a.innerHTML = window.languages[lang];
        a.className = 'lang';
        $(a).attr('data-lang', lang);
        L.DomEvent.on(a, 'click', switchLanguage.bind(a));
    }
}

/**
 * Show language selector
 */
function showLanguage() {
    hideAll();
    $('.leaflet-control-lang a.lang').each(function() {
        $(this).show();
    });
}
