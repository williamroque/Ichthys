const lightStylesheet = document.querySelector('#light-stylesheet');
const initialTheme = ipcRenderer.sendSync('read-settings')['theme'];

const messagePrompt = document.querySelector('#message-prompt');


if (initialTheme === 'light') {
    lightStylesheet.media = '';
}

ipcRenderer.on('parse-url', (_, url) => {
    search(decodeURI(url))
});

function showMessage(message) {
    messagePrompt.innerText = message;
    messagePrompt.classList.remove('hide');
}
