function saveOptions() {
    const darkModeEnabled = document.getElementById('darkModeToggle').checked;
    const options = {
        darkMode: darkModeEnabled
    };
    chrome.storage.sync.set(options, function () {
        console.log('Options saved: ', options);
    });
}

function loadOptions() {
    chrome.storage.sync.get(['envUUID', 'darkMode'], function (result) {
        if (!result.envUUID) {
            // UUID is used to make elements added by the extension unique
            const newUUID = crypto.randomUUID();
            chrome.storage.sync.set({ envUUID: newUUID }, function () {
                console.log('Generated new UUID: ', newUUID);
            });
        } else {
            console.log('Existing UUID: ', result.envUUID);
        }
        document.getElementById('darkModeToggle').checked = result.darkMode || false;
    });
}

document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('darkModeToggle').addEventListener('change', saveOptions);