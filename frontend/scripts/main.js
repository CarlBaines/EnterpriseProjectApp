'use strict';
const path = require("path");
const { app, BrowserWindow } = require('electron');

if (!app.isPackaged) {
  require('electron-reload')(path.join(__dirname, '..'), {
    electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron.cmd'),
    hardResetMethod: 'exit'
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 360,
    height: 800,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false, 
    transparent: false,
    webPreferences: {
      contextIsolation: true
    }
  });

  win.loadFile(path.join(__dirname, "..", "index.html"));
  return win;
}

app.on('ready', () => {
  let mainWindow = createWindow();

  mainWindow.loadFile(path.join(__dirname, "..", "index.html"));
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
