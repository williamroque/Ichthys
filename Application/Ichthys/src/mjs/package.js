const { ipcMain } = require('electron');
const path = require('path');

const FileIO = require('./fileio');
const fileio = new FileIO();


ipcMain.on('install-package', (event, packagePath) => {
    const packageData = fileio.readData(packagePath);
    const packageDirPath = path.join(
        fileio.path,
        packageData.lang
    );
    const indexPath = path.join(
        packageDirPath,
        'index.json'
    );

    let packageIndex;
    if (packageData.useBooks) {
        packageIndex = Object.keys(packageData.content);
    } else {
        packageIndex = packageData.aliases;
    }

    if (!fileio.pathExists(packageDirPath)) {
        fileio.createDir(packageDirPath);
    }

    const index = fileio.readData(indexPath);
    index[packageData.name] = packageIndex;
    fileio.writeData(index, indexPath);

    fileio.writeData(packageData, path.join(
        packageDirPath,
        `${packageData.name}.ichs`
    ));

    event.returnValue = [];
});
