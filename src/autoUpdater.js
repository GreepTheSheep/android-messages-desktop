const { autoUpdater } = require("electron-updater")
const log = require('electron-log')
const wait = require('util').promisify(setTimeout);
const ping = require('ping')
const EventEmitter = require('events');
const devMode = require('./checkDevMode.js')
module.exports = function(contents, customWindowEvent){
    try{
        if (devMode) {
            log.info('App started in dev mode')
            contents.executeJavaScript("document.getElementById('updatetxt').innerText = 'App started in dev mode'")
            customWindowEvent.emit('create-main')
        } else {
            var textChanged = false
            const myEmitter = new EventEmitter();
            const connexionChecker = ()=>{
                ping.sys.probe('google.com', function(isAlive){
                if (!isAlive){
                    log.info('Can\'t ping google.com, retrying in 1s')
                    contents.executeJavaScript("document.getElementById('displaytxt').innerText = 'No connexion, retrying'")
                    textChanged=true
                } else {
                    log.info('google.com is alive!')
                    if (textChanged) contents.executeJavaScript(`document.getElementById('displaytxt').innerText = 'Loading Android Messages...'`)
                    myEmitter.emit('online')
                }
                });
            }
            var connexionCheck = setInterval(connexionChecker, 1000)
        
            myEmitter.on('online', () =>{
                clearInterval(connexionCheck)
                autoUpdater.checkForUpdatesAndNotify();
    
                autoUpdater.on('checking-for-update', () => {
                    log.info('Checking for updates...')
                    contents.executeJavaScript("document.getElementById('updatetxt').innerText = 'Checking for updates...'")
                })
                autoUpdater.on('update-available', (info) => {
                    log.verbose('Update available!')
                    contents.executeJavaScript("document.getElementById('updatetxt').innerText = 'Update available.'")
                    console.log(info)
                })
                autoUpdater.on('update-not-available', (info) => {
                    log.verbose('No updates available')
                    contents.executeJavaScript("document.getElementById('updatetxt').innerText = 'Update not available.'")
                    console.log(info)
                    customWindowEvent.emit('create-main')
                })
                autoUpdater.on('error', (err) => {
                    log.warn('Error in updater: ', err)
                    contents.executeJavaScript("document.getElementById('updatetxt').innerText = 'Error in auto-updater.'")*
                    wait(5000).then(()=>{
                        customWindowEvent.emit('create-main')
                    })
                })
                autoUpdater.on('download-progress', (progressObj) => {
                    log.verbose(progressObj)
                    contents.executeJavaScript(`document.getElementById('updatetxt').innerText = \`${progressObj.percent}% - ${progressObj.transferred}/${progressObj.total} (${progressObj.bytesPerSecond})\``)
                })
                autoUpdater.on('update-downloaded', (info) => {
                    log.info('Update downloaded!')
                    log.verbose(info)
                    contents.executeJavaScript("document.getElementById('updatetxt').innerText = 'Update downloaded'")
                    wait(5000).then(()=>{
                        autoUpdater.quitAndInstall();
                    })
                })
            })
        }
    } catch (err) {
        contents.executeJavaScript("document.getElementById('updatetxt').innerText = 'Error in auto-updater.'")
        log.warn('Error in updater: ', err)
        wait(5000).then(()=>{
            customWindowEvent.emit('create-main')
        })
    }
}