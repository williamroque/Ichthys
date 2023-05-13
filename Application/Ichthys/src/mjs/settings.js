const path = require('path');
const { ipcMain } = require('electron');

const FileIO = require('./fileio');
const fileio = new FileIO();


const settingsPath = path.join(fileio.path, 'settings.json');

const defaultSettings = {
    lang: 'English',
    theme: 'Light'
};

function readSettings() {
    if (fileio.pathExists(settingsPath))
        return fileio.readData(settingsPath);
    return defaultSettings;
}

function writeSettings(prop, value) {
    let settings = readSettings();

    settings[prop] = value;

    fileio.writeData(settings, settingsPath);
}

ipcMain.on('read-settings', event => {
    event.returnValue = readSettings();
});

ipcMain.on('write-settings', (event, prop, value) => {
    writeSettings(prop, value);
    event.returnValue = [];
});

exports.readSettings = readSettings;
exports.writeSettings = writeSettings;
