const { ipcRenderer } = require('electron');

const lightStylesheet = document.querySelector('#light-stylesheet');
const settingsElement = document.querySelector('#settings');

let settings, currentDropdown;
let settingControllers = [];

function loadSettings() {
    settings = ipcRenderer.sendSync('read-settings');

    if (settings['theme'] === 'Light') {
        lightStylesheet.media = '';
    } else {
        lightStylesheet.media = 'none';
    }

    settingControllers.forEach(controller => {
        controller.setter(settings[controller.id]);
    });
}
loadSettings();

ipcRenderer.on('settings-changed', loadSettings);

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
            options: ['Dark', 'Light']
        }
    ],
    'Shortcuts': []
};

class Setting {
    constructor(id, label, type, options, defaultValue) {
        this.id = id;
        this.label = label;
        this.type = type;
        this.options = options;

        this.value = defaultValue;

        this.setter = () => {};
    }

    buildSelect() {
        const settingRow = document.createElement('tr');
        settingRow.classList.add('setting-row');

        const labelWrapper = document.createElement('td');
        labelWrapper.classList.add('label-wrapper');
        settingRow.appendChild(labelWrapper);

        const labelText = document.createTextNode(this.label);
        labelWrapper.appendChild(labelText);

        const inputWrapper = document.createElement('td');
        inputWrapper.classList.add('input-wrapper');
        settingRow.appendChild(inputWrapper);

        const input = document.createElement('div');
        input.classList.add('select-input');
        inputWrapper.appendChild(input)

        const inputText = document.createTextNode(this.value);
        input.appendChild(inputText);

        const dropdown = document.createElement('div');
        dropdown.classList.add('select-dropdown');
        dropdown.classList.add('hide');
        inputWrapper.appendChild(dropdown);

        for (const option of this.options) {
            const dropdownItem = document.createElement('div');
            dropdownItem.classList.add('dropdown-item');
            dropdown.appendChild(dropdownItem);

            if (option === this.value) {
                dropdownItem.classList.add('dropdown-item-selected');
            }

            const dropdownItemText = document.createTextNode(option);
            dropdownItem.appendChild(dropdownItemText);

            this.setter = value => {
                const target = [...dropdown.children].find(
                    e => e.innerText === value
                );

                const currentActive = dropdown.querySelector('.dropdown-item-selected');
                currentActive.classList.remove('dropdown-item-selected');
                target.classList.add('dropdown-item-selected');

                this.value = target.innerText;

                input.innerText = this.value;
            };

            dropdownItem.addEventListener('click', e => {
                this.setter(e.currentTarget.innerText);

                ipcRenderer.sendSync('write-settings', this.id, this.value);
                ipcRenderer.sendSync('notify-settings-changed', this.id, this.value);
            }, false);
        }

        input.addEventListener('click', e => {
            if (currentDropdown) {
                currentDropdown.classList.add('hide');
            }

            currentDropdown = dropdown;

            dropdown.classList.remove('hide');

            e.stopPropagation();
        }, false);

        return settingRow;
    }

    build() {
        switch (this.type) {
        case 'select':
            return this.buildSelect();
        default:
            console.error('Invalid setting.');
        }
    }
}

for (const heading in template) {
    const headingElement = document.createElement('h1');

    const headingText = document.createTextNode(heading);
    headingElement.appendChild(headingText);

    headingElement.classList.add('settings-heading');
    settingsElement.appendChild(headingElement);

    const settingsWrapper = document.createElement('table');
    settingsWrapper.classList.add('settings-wrapper');

    for (const settingTemplate of template[heading]) {
        const { id, label, type, options } = settingTemplate;
        const defaultValue = settings[id];

        const setting = new Setting(id, label, type, options, defaultValue);
        settingControllers.push(setting);

        settingsWrapper.appendChild(setting.build());
    }

    settingsElement.appendChild(settingsWrapper);
}

document.addEventListener('click', () => {
    if (currentDropdown) {
        currentDropdown.classList.add('hide');

        currentDropdown = undefined;
    }
}, false);
