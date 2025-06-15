const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = true;
// console.log("Loading db...");


const db = require("./db");
console.log("DB loaded successfully.");

require('./authHandler')
require('./handlers')
function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "build/index.html")}`
  ).catch((error) => {
    console.error("Error loading URL:", error);
  });

  if (isDev) {
    win.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
