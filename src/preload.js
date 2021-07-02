// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const customTitlebar = require('custom-electron-titlebar');
const {remote} = require('electron')
const log = require('electron-log')
const devMode = remote.require('./checkDevMode.js')
const openAboutWindow = require('about-window').default

document.addEventListener('DOMContentLoaded', () => {
  // It does not make sense to use the custom titlebar on macOS where
  // it only tries to simulate what we get with the normal behavior anyway.
  if (process.platform != 'darwin') {

    // add a menu
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
            type: 'separator'
          },
          {
            label: 'Exit',
            click(){
                var confirm = remote.dialog.showMessageBoxSync(remote.getCurrentWindow(), {
                    message: "Are you sure to exit? You will not receive any notifications while it is closed",
                    type: "warning",
                    buttons: [
                        "Yes",
                        "No"
                    ],
                    title: "Android Messages",
                    cancelId: 1
                })
                if (confirm == 0){
                    window.close()
                }
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

    const titlebar = new customTitlebar.Titlebar({
        backgroundColor: customTitlebar.Color.fromHex('#1A73E8'),
        icon: 'https://ssl.gstatic.com/images/branding/product/2x/messages_96dp.png',
        menu
    });
    titlebar.updateTitle(`${devMode?'👨‍💻 ':''}Android Messages`);
  }
})

document.addEventListener('readystatechange', () => {

  if (document.readyState == 'interactive'){
    var head = document.getElementsByTagName('head')[0];
    var sty = document.createElement('style');
    sty.type = 'text/css';
    var css = `
      .titlebar{
        z-index: 999999;
        font-family: arial;
      }
      .titlebar .window-title{
        font-family: 'Product Sans';
      }
      mws-ui-lazy-loaded-extension{
        display: none;
      }
      ` // You can compress all css files you need and put here
    if (sty.styleSheet){
      sty.styleSheet.cssText = css;
    } else {
      sty.appendChild(document.createTextNode(css));
    }
    head.appendChild(sty);
  }
});

/*global document,window*/
/*eslint no-undef: "error"*/