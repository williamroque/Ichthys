const { ipcRenderer } = require('electron');

const lightStylesheet = document.querySelector('#light-stylesheet');
const initialTheme = ipcRenderer.sendSync('read-settings')['theme'];

if (initialTheme === 'light') {
    lightStylesheet.media = '';
}

const settingsElement = document.querySelector('#settings');

const template = {
    'General': [
        {
            id: 'lang',
            label: 'Language',
            type: 'select',
            options: ipcRenderer.sendSync('get-languages')
        },
        {
            id: 'theme',
            label: 'Theme',
            type: 'select',
            options: ['dark', 'light']
        }
    ],
    'Shortcuts': []
};

for (const heading in template) {
    const headingElement = document.createElement(heading);
    headingElement.classList.add('settings-heading');
    settingsElement.appendChild(headingElement);
}
