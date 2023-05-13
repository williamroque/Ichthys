const lightStylesheet = document.querySelector('#light-stylesheet');
const initialTheme = ipcRenderer.sendSync('read-settings')['theme'];

const messagePrompt = document.querySelector('#message-prompt');


let currentMatch;


if (initialTheme === 'light') {
    lightStylesheet.media = '';
}

ipcRenderer.on('parse-url', (_, url) => {
    currentMatch = search(decodeURI(url))
});

function showMessage(message) {
    messagePrompt.innerText = message;
    messagePrompt.classList.remove('hide');
}
