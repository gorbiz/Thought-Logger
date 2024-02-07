const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron')
let win
let tray = null

function createWindow() {
  if (win) {
    win.show()
    return
  }
  win = new BrowserWindow({
    width: 800,
    height: 200,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
  })

  win.loadFile('index.html') // Load your HTML file
  // win.loadURL('https://yourapp.com') // TODO probably (share code with PWA / web app)

  win.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      win.hide() // Hide the window instead of closing it
    }
    return false
  })

  win.webContents.openDevTools()

  win.webContents.on('did-finish-load', () => {
    console.log('1221')
    win.webContents.executeJavaScript(`
      document.addEventListener('keydown', (event) => {
        console.log(1, event.key, event.key === 'Escape')
        if (event.key === 'Escape') {
          console.log(2)
          require('electron').ipcRenderer.send('hide-window')
        }
      })
    `)
  })
}

ipcMain.on('hide-window', () => {
  if (win) win.hide()
})

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })

  app.on('ready', () => {
    createWindow()

    tray = new Tray('/home/gorbiz/code/logger/thought-app/icon.png') // Add your own icon path, not working?
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