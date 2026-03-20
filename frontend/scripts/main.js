"use strict";
const path = require("path");
const { app, BrowserWindow } = require("electron");


if (!app.isPackaged) {
  try {
    require("electron-reload")(path.join(__dirname, ".."), {
      electron: process.execPath, // fixes "Provided electron executable cannot be found"
      hardResetMethod: "exit",
    });
  } catch (err) {
    console.warn("electron-reload disabled:", err.message);
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 360,
    height: 800,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: true,
    transparent: false,
    webPreferences: {
      contextIsolation: true,
    },
  });
//win.webContents.openDevTools();
  // win.setMenu(null);
  win.loadURL("http://127.0.0.1:3002/pages/index.html"); // Load the homepage from the backend server
  return win;
}

app.on("ready", () => {
  createWindow(); // (removed duplicate loadFile)
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
