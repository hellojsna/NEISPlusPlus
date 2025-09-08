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

const logoElem = document.getElementsByClassName("hd-logo");
function overrideDarkModeLogo(darkMode) {
    if (logoElem.length == 0) {
        return
    }
    let image = logoElem[0].getElementsByTagName("img")[0];
    if (image.src.endsWith("logo.svg")) {
        image.src = darkMode ? "./assets/neisplus/images/theme/dark/logo.svg" : "./assets/neisplus/images/logo.svg";
    }
}
function addLogoUpdateObserver() {
    let lastURL = location.href;
    new MutationObserver(() => {
        const currentURL = location.href;
        if (currentURL !== lastURL) {
            lastURL = currentURL;
            console.log('URL changed to: ' + currentURL);
            checkDarkMode();
        }
    }).observe(document, { attributes: true, childList: true, subtree: true });
}

let lastThemeInjectObserveTime = 0;
let themeInjectAlerted = false;
function addThemeInjectObserver() {
    let disabledCSSHref = "assets/scss/lab/theme/stdLabDef.css";
    new MutationObserver(() => {
        if (Date.now() - lastThemeInjectObserveTime < 3000) { // document 내용 바뀔 때마다 alert 표시 방지
            return;
        }
        console.log("Checking for conflicting theme CSS...");
        const themeCSS = document.getElementById("csp-lab-theme-css");
        if (themeCSS && !themeCSS.href.includes(disabledCSSHref)) {
            lastThemeInjectObserveTime = Date.now();
            if (!themeInjectAlerted) {
                alert("실험실 테마는 NEIS++의 다크 모드와 호환되지 않습니다.");
            }
            themeInjectAlerted = !themeInjectAlerted;
            console.log(themeInjectAlerted);
        }
    }).observe(document, { attributes: true, childList: true, subtree: true });
}

function injectCSS(file, elementId, envUUID) {
    // This function should NOT be called directly, use checkDarkMode().
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

function checkDarkMode() {
    chrome.storage.sync.get(['envUUID', 'darkMode'], function (result) {
        if (result.darkMode) {
            injectCSS('css/theme_dark.css', 'theme_dark', result.envUUID);
        } else {
            const linkId = obfuscateId('NPP_CSS_theme_dark', result.envUUID);
            if (document.getElementById(linkId)) {
                document.getElementById(linkId)?.remove();
            }
        }
        overrideDarkModeLogo(result.darkMode);
    });
}

function injectFontCSS() {
    chrome.storage.sync.get(['envUUID'], function (result) {
        injectCSS('fonts/pretendard-gov-subset.css', 'font_pretendard_gov', result.envUUID);
    });
}
chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (changes.darkMode) {
        checkDarkMode();
    }
});

checkDarkMode();
injectFontCSS();
setTimeout(checkDarkMode, 2000); // Retry after 2 seconds to make sure dark mode is applied even if the page loads slowly.
addLogoUpdateObserver();
addThemeInjectObserver();
