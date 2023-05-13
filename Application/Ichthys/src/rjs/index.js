const lightStylesheet = document.querySelector('#light-stylesheet');
const messagePrompt = document.querySelector('#message-prompt');


let currentMatch;

function loadLanguage(language) {
    if (currentMatch) {
        const [book, key, chapter, verse, otherVerses] = currentMatch;
        const index = ipcRenderer.sendSync('request-index', language)[book];
        const title = reverseGet(index, key);

        saveVerseExcursion(() => {
            if (verse) {
                if (otherVerses) {
                    search(`${title} ${chapter}:${verse}-${otherVerses}`);
                } else {
                    search(`${title} ${chapter}:${verse}`);
                }
            } else {
                search(`${title} ${chapter}`);
            }
        });
    }
}

function loadSettings() {
    settings = ipcRenderer.sendSync('read-settings');

    if (settings['theme'] === 'Light') {
        lightStylesheet.media = '';
    } else {
        lightStylesheet.media = 'none';
    }

    loadLanguage(settings['lang']);
}
loadSettings();

ipcRenderer.on('settings-changed', loadSettings);

ipcRenderer.on('parse-url', (_, url) => {
    currentMatch = search(decodeURI(url))
});

function showMessage(message) {
    messagePrompt.innerText = message;
    messagePrompt.classList.remove('hide');
}
