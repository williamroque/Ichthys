const {
    app,
    BrowserWindow,
    dialog,
    ipcMain
} = require('electron');

const path = require('path');

const windowStateKeeper = require('electron-window-state');

const FileIO = require('./fileio');

const fileio = new FileIO();
fileio.setup();

require('./package.js');
require('./settings.js');
require('./language.js');

const url = require('url');

const fixPath = require('fix-path');
fixPath();

const mainWinObject = {
    center: true,
    icon: '../assets/icon.png',
    titleBarStyle: 'hidden',
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#020014',
    show: false,
    webPreferences: {
        nodeIntegration: true
    }
};

let mainWin;
let openURL;

function createWindow() {
    let mainWindowState = windowStateKeeper({
        defaultWidth: 800,
        defaultHeight: 600
    });

    mainWinObject.width = mainWindowState.width;
    mainWinObject.height = mainWindowState.height;

    mainWin = new BrowserWindow(mainWinObject);
    mainWin.loadURL(url.format({
        pathname: path.join(__dirname, '../html/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWin.webContents.once('did-finish-load', () => {
        mainWin.show();

        if (openURL) {
            mainWin.webContents.send('parse-url', openURL);
            openURL = undefined;
        }
    });
    mainWin.on('closed', e => mainWin = null);

    mainWindowState.manage(mainWin);
};

let windowPromise = new Promise((resolve, _) => {
    app.on('ready', () => {
        createWindow();
        resolve();
    });
});

app.on('activate', () => {
    if (!mainWin) {
        mainWin = createWindow();
    }
});

ipcMain.on('request-index', (event, lang) => {
    event.returnValue = fileio.readData(path.join(
        fileio.path,
        lang,
        'index.json'
    ));
});

ipcMain.on('request-book', (event, book, lang) => {
    event.returnValue = fileio.readData(path.join(
        fileio.path,
        lang,
        book + '.ichs'
    ));
});

function registerURLScheme() {
    app.on('open-url', (event, url) => {
        if (mainWin) {
            mainWin.webContents.send('parse-url', url);
        } else {
            openURL = url;
        }
    });
}

if (process.platform === 'darwin') {
    registerURLScheme();
} else {
    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
        app.quit();
    } else {
        app.on('second-instance', (event, commandLine, workingDirectory) => {
            if (mainWin) {
                if (mainWin.isMinimized()) mainWin.restore();
                mainWin.focus();
            }
        });

        registerURLScheme();
    }
}
