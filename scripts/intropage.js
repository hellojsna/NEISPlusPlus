/* Basic codes copied from root.js */
function obfuscateId(id, envUUID) {
    // obfuscate the id using envUUID
    if (id.length > envUUID.length) {
        throw new Error('Id is too long to obfuscate.');
    }
    const idLength = id.length;
    const step = Math.floor(envUUID.length / id.length);
    let obfuscatedId = '';
    for (let i = 0; i < idLength; i++) {
        obfuscatedId += envUUID.slice(i * step, (i + 1) * step) + id[i];
    }
    obfuscatedId += envUUID.slice(idLength * step);
    return obfuscatedId;
}
function injectCSS(file, elementId, envUUID) {
    // This function should NOT be called directly, use checkIntroDarkMode().
    if (!envUUID) {
        throw new Error('envUUID is required to inject CSS.');
    }
    const linkId = obfuscateId(`NPP_CSS_${elementId}`, envUUID);
    if (document.getElementById(linkId)) {
        return; // CSS already injected
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = chrome.runtime.getURL(file);
    link.id = obfuscateId(`NPP_CSS_${elementId}`, envUUID);
    document.head.appendChild(link);
}
function checkIntroDarkMode() {
    chrome.storage.sync.get(['envUUID', 'darkMode'], function (result) {
        if (result.darkMode) {
            injectCSS('css/intropage_dark.css', 'intropage_dark', result.envUUID);
        } else {
            const linkId = obfuscateId('NPP_CSS_intropage_dark', result.envUUID);
            if (document.getElementById(linkId)) {
                document.getElementById(linkId)?.remove();
            }
        }
    });
}

chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (changes.darkMode) {
        checkIntroDarkMode();
    }
});

checkIntroDarkMode();
setTimeout(checkIntroDarkMode, 2000); // Retry after 2 seconds to make sure dark mode is applied even if the page loads slowly.