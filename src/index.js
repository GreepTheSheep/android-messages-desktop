const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron')
const log = require('electron-log')
console.log('Log file is located at', log.transports.file.getFile().path)
const path = require('path')
const EventEmitter = require('events');
const customWindowEvent = new EventEmitter()

var closeLoadWindow
var loadWindow
var resolved
var appIcon = null;
var contextMenu = null;
var mainWindow = null;

let isSingleInstance = app.requestSingleInstanceLock()
if (!isSingleInstance) {
  app.quit()
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (!mainWindow.isVisible()) mainWindow.show()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.setAppUserModelId("Android Messages")
app.on('ready', async () => {
    resolved = false
    loadWindow = new BrowserWindow({
        width: 400,
        height: 310,
        webPreferences: {
        enableRemoteModule: true,
        nodeIntegration: false,
        },
        transparent: false,
        backgroundColor: '#1759BC',
        icon: 'build/icon.png',
        title: 'Android Messages Updater',
        frame: false,
        center: true,
        show: false
    });
    loadWindow.loadURL(`file://${__dirname}/loadWindow/index.html`)
    loadWindow.setAlwaysOnTop(true); 
    loadWindow.once('ready-to-show', () => {
        loadWindow.show();
    });
    var checkMaximize = setInterval(() => {
        if (loadWindow) loadWindow.unmaximize()
    }, 0)
    closeLoadWindow = () => {
        clearInterval(checkMaximize)
        loadWindow.close();
    };

    var contents = loadWindow.webContents
    //contents.openDevTools()
    //await wait(5000)

    require('./autoUpdater.js')(true, contents, customWindowEvent)
    
    loadWindow.once('close', () =>{
        loadWindow = null
        if (resolved == false) {
        app.quit()
        process.exit(0)
        }
    })
    ipcMain.on('closeLoad', () => {
        if (loadWindow != null) closeLoadWindow()
    })
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (app.isQuiting) {
    log.info('Goodbye!')
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
    if (mainWindow == null && BrowserWindow.getAllWindows().length === 0 && process.platform == 'darwin') {
      customWindowEvent.emit('create-main')
    } else if (mainWindow != null){
        mainWindow.show()
    }
})

customWindowEvent.on('create-main', ()=>{
  resolved = true
  // Create the browser window.
    mainWindow = new BrowserWindow({
      show : false,
      //backgroundColor: '#000F42',
      icon: 'build/icon.png',
      title: 'Android Messages',
      frame: process.platform == 'darwin',
      titleBarStyle: "hidden",
      width: 1100,
      height: 700,
      webPreferences: {
        enableRemoteModule: true,
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
      }
    })
    log.mainWindow = log.scope('Main');
    log.mainWindow.verbose('Main window called')

    mainWindow.setMenu(null);
    
    mainWindow.flashFrame(true)
    mainWindow.once('focus', () => mainWindow.flashFrame(false))

    mainWindow.webContents.on('devtools-opened', () => log.mainWindow.verbose('Dev Tools opened'))
    mainWindow.webContents.on('devtools-closed', () => log.mainWindow.verbose('Dev Tools closed'))

    // and load the index.html of the app.
    //mainWindow.loadFile('content/mainWindow/index.html')
    mainWindow.loadURL(`https://messages.google.com/web`)

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    if (loadWindow != null) loadWindow.close();
  })

  mainWindow.webContents.on('new-window', function(e, url) {
      e.preventDefault();
      require('electron').shell.openExternal(url);
  });

    mainWindow.on('close', function (event) {
        if(!app.isQuiting){
            event.preventDefault();
            mainWindow.hide();
        }

        return false;
    });

    appIcon = new Tray(path.join(__dirname, "libs", "icon.png"));
    contextMenu = Menu.buildFromTemplate([
        { 
            label: 'Show App',
            click:  function(){
                mainWindow.show();
            }
        },
        {
            label: 'Quit',
            click:  function(){
                app.isQuiting = true;
                app.quit();
            }
        }
    ]);
    appIcon.setToolTip('Android Messages');
    appIcon.setTitle('Android Messages');
    appIcon.setContextMenu(contextMenu);

    appIcon.on('double-click', ()=>{
        mainWindow.show()
    })
    appIcon.on('right-click', ()=>{
        contextMenu.popup()
    })
})