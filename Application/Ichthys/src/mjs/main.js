const {
    app,
    BrowserWindow,
    dialog,
    ipcMain,
    Menu,
    Accelerator
} = require('electron');

const isMac = process.platform === 'darwin';

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
    minWidth: 600,
    minHeight: 450,
    backgroundColor: '#020014',
    show: false,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
    }
};
const settingsWinObject = {
    center: true,
    icon: '../assets/icon.png',
    titleBarStyle: 'hidden',
    width: 350,
    height: 500,
    resizable: false,
    backgroundColor: '#020014',
    show: false,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
    }
};

let mainWin;
let settingsWin;
let openURL;

function createWindow() {
    let mainWindowState = windowStateKeeper({
        defaultWidth: 800,
        defaultHeight: 600
    });

    mainWinObject.width = mainWindowState.width;
    mainWinObject.height = mainWindowState.height;

    mainWinObject.x = mainWindowState.x;
    mainWinObject.y = mainWindowState.y;

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

function openPreferences() {
    settingsWin = new BrowserWindow(settingsWinObject);

    settingsWin.loadURL(url.format({
        pathname: path.join(__dirname, '../html/settings.html'),
        protocol: 'file:',
        slashes: true
    }));

    settingsWin.webContents.once('did-finish-load', () => {
        settingsWin.show();
    });
    settingsWin.on('closed', e => settingsWin = null);
}

ipcMain.on('notify-settings-changed', event => {
    if (mainWin) {
        mainWin.webContents.send('settings-changed');
    }

    if (settingsWin) {
        settingsWin.webContents.send('settings-changed');
    }

    event.returnValue = '';
});

const template = [
    ...(isMac ? [{
        label: app.name,
        submenu: [
            { role: 'about' },
            { type: 'separator' },
            {
                label: 'Preferences',
                click: openPreferences,
                accelerator: 'CmdOrCtrl+,'
            },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    }] : []),
    {
        label: 'Edit',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            ...(isMac ? [
                { role: 'delete' },
                { role: 'selectAll' },
                { type: 'separator' },
                {
                    label: 'Speech',
                    submenu: [
                        { role: 'startSpeaking' },
                        { role: 'stopSpeaking' }
                    ]
                }
            ] : [
                { role: 'delete' },
                { type: 'separator' },
                { role: 'selectAll' }
            ])
        ]
    },
    {
        label: 'View',
        submenu: [
            { type: 'separator' },
            { role: 'resetZoom' },
            { role: 'zoomIn' },
            { role: 'zoomOut' },
            { type: 'separator' },
            { role: 'togglefullscreen' },
            { role: 'toggleDevTools' }
        ]
    },
    {
        label: 'Window',
        submenu: [
            { role: 'minimize' },
            { role: 'zoom' },
            ...(isMac ? [
                { type: 'separator' },
                { role: 'front' },
                { type: 'separator' },
                { role: 'window' },
                { role: 'close' }
            ] : [
                { role: 'close' }
            ])
        ]
    }
]

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

if (isMac) {
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
