var {ipcRenderer} = require('electron')
const { autoUpdater } = require("electron-updater")

try{
    autoUpdater.on('checking-for-update', () => {
        document.getElementById('updatetxt').innerText = 'Checking for updates...'
    })
    autoUpdater.on('update-available', (info) => {
        //document.getElementById('updatetxt').innerText = 'Update available.';
        console.log(info)
    })
    autoUpdater.on('update-not-available', (info) => {
        //document.getElementById('updatetxt').innerText = 'Update not available.';
        console.log(info)
        ipcRenderer.send('online');
    })
    autoUpdater.on('error', (err) => {
        document.getElementById('updatetxt').innerText = 'Error in auto-updater.'
        console.error(err);
        ipcRenderer.send('online');
    })
    autoUpdater.on('download-progress', (progressObj) => {
        document.getElementById('updatetxt').innerText = `${progressObj.percent}% - ${progressObj.transferred}/${progressObj.total} (${progressObj.bytesPerSecond})`
    })
    autoUpdater.on('update-downloaded', (info) => {
        document.getElementById('updatetxt').innerText = 'Update downloaded';
        console.log(info)
        autoUpdater.quitAndInstall();
    });
} catch (err) {
    document.getElementById('updatetxt').innerText = 'Error in auto-updater.'
    console.error(err);
    ipcRenderer.send('online');
}


/*global document*/
/*eslint no-undef: "error"*/