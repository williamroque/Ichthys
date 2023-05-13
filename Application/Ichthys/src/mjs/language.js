const { ipcMain } = require('electron');
const path = require('path');

const { readSettings, writeSettings } = require('./settings');

const FileIO = require('./fileio');
const fileio = new FileIO();


function getLanguages() {
    const languages = fileio.listDir(fileio.path).filter(fileName => {
        return fileio.pathExists(path.join(
            fileio.path,
            fileName,
            'index.json'
        ));
    });

    return languages;
}

ipcMain.on('change-language', event => {
    const languages = getLanguages();
    const settings = readSettings();

    const index = (languages.indexOf(settings['lang']) + 1) % languages.length;

    writeSettings('lang', languages[index]);

    event.returnValue = languages[index];
});

ipcMain.on('get-languages', event => {
    event.returnValue = getLanguages();
});
