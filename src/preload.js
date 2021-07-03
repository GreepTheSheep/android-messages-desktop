// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const customTitlebar = require('custom-electron-titlebar');
const {remote} = require('electron')
const log = require('electron-log').scope('Main')
const devMode = remote.require('./checkDevMode.js')
const path = require('path')

var titleObj = {
    baseTitle: "Android Messages",
    devMode: "👨‍💻",
    separator: " - ",
    contactName: ""
}
var titlebar

document.addEventListener('DOMContentLoaded', () => {
    if (process.platform != 'darwin') {
        titlebar = new customTitlebar.Titlebar({
            backgroundColor: customTitlebar.Color.fromHex('#1A73E8'),
            icon: 'https://ssl.gstatic.com/images/branding/product/2x/messages_96dp.png',
            menu: require('./menu')(remote, log, devMode)
        });
        var title = []
        if (devMode) title.push(titleObj.devMode)
        title.push(titleObj.baseTitle)
        titlebar.updateTitle(title.join(' '));
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

const observer = new MutationObserver((mutationsList)=>{
    for(const mutation of mutationsList) {
        if (mutation.target.nodeName == 'H2'){
            titleObj.contactName = mutation.target.textContent
            var title = []
            if (devMode) title.push(titleObj.devMode)
            title.push(titleObj.contactName)
            title.push(titleObj.baseTitle)
            titlebar.updateTitle(title.join(titleObj.separator));
        }

        if(mutation.target.nodeName == "TITLE" && !mutation.target.textContent.endsWith(titleObj.baseTitle)){
            var notifNumber = Number(mutation.target.textContent.substring(mutation.target.textContent.indexOf('(')+1,mutation.target.textContent.indexOf(')')))
            if (notifNumber != ""){
                titleObj.contactName = (notifNumber > 9?"("+notifNumber + ") ":"") + titleObj.contactName
                // eslint-disable-next-line no-redeclare
                var title = []
                if (devMode) title.push(titleObj.devMode)
                title.push(titleObj.contactName)
                title.push(titleObj.baseTitle)
                titlebar.updateTitle(title.join(titleObj.separator));

                remote.getCurrentWindow().setOverlayIcon(path.join(__dirname, 'libs', 'overlayIcon', `${notifNumber > 9 ? 'more' : notifNumber}.png`), "Notification")
            } else remote.getCurrentWindow().setOverlayIcon(null, "No Notifications")
        }
    }
});
observer.observe(document, {attributes: true, childList: true, subtree: true});

/*global document,MutationObserver*/
/*eslint no-undef: "error"*/