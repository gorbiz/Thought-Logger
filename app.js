const path = require('path')
const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron')
let win
let tray = null

function createWindow() {
  if (win) {
    win.show()
    return
  }
  win = new BrowserWindow({
    width: 1024,
    height: 200,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js') }
  })

  win.loadFile('index.html')
  // win.loadURL('https://yourapp.com') // TODO probably (share code with PWA / web app)

  win.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      win.hide() // Hide the window instead of closing it
    }
    return false
  })

  // win.webContents.openDevTools()

  // NOTE how to inject javascript that we don't want to be in the HTML file (& the web / PWA version)
  // ...but then we put it in preload.js?? 
  // win.webContents.on('did-finish-load', () => {
  //   win.webContents.executeJavaScript()
  // })
}

ipcMain.on('hide-window', () => {
  if (win) win.hide()
})

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  console.debug('Another instance is running, quitting.')
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    console.debug('second-instance detected, focusing window...')
    if (!win) return
    // if (win.isMinimized()) win.restore() // no need?
    // win.focus() // no need?
    win.show()
    // TODO select the text in the input field (that might have been left since before)
  })

  app.on('ready', () => {
    createWindow()
    
    tray = new Tray(path.join(__dirname, 'icon.png'))    
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show', click: () => win.show() },
      { label: 'Exit', click: () => {
        app.isQuitting = true
        app.quit()
      }}
    ])
    tray.setToolTip('Your App Name')
    tray.setContextMenu(contextMenu)
  })

  app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
    else win.show()
  })
}