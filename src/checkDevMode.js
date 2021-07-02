const execArgs = process.argv;
const { autoUpdater } = require("electron-updater")
module.exports = !autoUpdater.app.isPackaged || execArgs.includes('--develop') || execArgs.includes('-d')