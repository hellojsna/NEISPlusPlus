function obfuscateID(id, envUUID) {
    // obfuscate the id using envUUID
    if (id.length > envUUID.length) {
        throw new Error('ID is too long to obfuscate');
    }
    const idLength = id.length;
    const step = Math.floor(envUUID.length / id.length);
    let obfuscatedID = '';
    for (let i = 0; i < idLength; i++) {
        obfuscatedID += envUUID.slice(i * step, (i + 1) * step) + id[i];
    }
    obfuscatedID += envUUID.slice(idLength * step);
    return obfuscatedID;
}
function checkDarkMode() {
    chrome.storage.sync.get(['envUUID', 'darkMode'], function (result) {
        if (result.darkMode) {
            injectCSS('css/theme_dark.css', result.envUUID);
        } else {
            document.getElementById(obfuscateID('NPP_CSS_theme_dark', result.envUUID))?.remove();
        }
    });
}
function injectCSS(file, envUUID) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = chrome.runtime.getURL(file);
    link.id = obfuscateID('NPP_CSS_theme_dark', envUUID);
    document.head.appendChild(link);
}

chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (changes.darkMode) {
        checkDarkMode();
    }
});

checkDarkMode();