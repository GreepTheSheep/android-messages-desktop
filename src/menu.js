const openAboutWindow = require('about-window').default
module.exports = function(remote, log, devMode){
    const menu = new remote.Menu();

    menu.append(new remote.MenuItem({
        label: 'File',
        submenu: [{
            label: 'About',
            click(){
              log.verbose("About called")
              var aboutWindow = openAboutWindow({
                icon_path: `${__dirname}/libs/icon.png`,
                product_name: 'Android Messages',
                description: `The unofficial but open-source desktop app for Android Messaging`,
                homepage: 'https://github.com/GreepTheSheep/android-messages-desktop',
                license: 'Apache-2.0',
                use_version_info: true,
                adjust_window_size: false,
                use_inner_html: true,
                bug_report_url: 'https://github.com/GreepTheSheep/android-messages-desktop/issues',
                bug_link_text: '🐛 Found bug?',
                open_devtools: false,
                win_options: {
                  show: false,
                  maximizable: false,
                  resizable: false,
                  minimizable: false,
                  alwaysOnTop: true,
                  parent: remote.getCurrentWindow()
                }
              });
              aboutWindow.setTitle('About Android Messages')
              aboutWindow.on('ready-to-show', () =>{
                aboutWindow.show()
              })
            }
          },
          {
            label: 'Check for Updates',
            click(){
                remote.require('./autoUpdater')(false, remote.getCurrentWindow().webContents, undefined)
            }
          }]
      }));

    if (devMode) {
      menu.append(new remote.MenuItem({
        label: 'Developer Mode',
        submenu: [{
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',	
          click (item, focusedWindow) {
            if (focusedWindow) remote.getCurrentWebContents().toggleDevTools()
          }	
        },
        {
          label: 'Open Log Folder',
          click(){
            remote.shell.showItemInFolder(log.transports.file.getFile().path)
          }
        }]
      }));
    }

    return menu
}