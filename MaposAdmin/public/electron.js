// public/electron.js

const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load React App (dev)
  win.loadURL("http://localhost:3001");

  // 🚨 UNCOMMENTED LINE 🚨
  win.webContents.openDevTools(); 
}

app.whenReady().then(createWindow);
// ... (rest of the file remains the same) ...