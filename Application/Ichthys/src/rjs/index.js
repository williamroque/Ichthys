const lightStylesheet = document.querySelector('#light-stylesheet');
const initialTheme = ipcRenderer.sendSync('read-settings')['theme'];


if (initialTheme === 'light') {
    lightStylesheet.media = '';
}

ipcRenderer.on('parse-url', (_, url) => {
    search(decodeURI(url))
});

document.addEventListener('keydown', e => {
    if (e.key === 'l') {
        ipcRenderer.sendSync('change-language');
    } else if (e.key === 't') {
        if (lightStylesheet.media) {
            lightStylesheet.media = '';
            ipcRenderer.sendSync('write-settings', 'theme', 'light');
        } else {
            lightStylesheet.media = 'none';
            ipcRenderer.sendSync('write-settings', 'theme', 'dark');
        }

    }
}, false);
