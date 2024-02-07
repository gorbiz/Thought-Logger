const { app, BrowserWindow, Tray, Menu, globalShortcut } = require('electron')
let win
let tray = null

// CONSIDER electron-window-state to remember window position

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 200,
    frame: false,
    transparent: true,
    alwaysOnTop: true
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
}

app.on('ready', () => {
  createWindow()

  tray = new Tray('/home/gorbiz/code/logger/thought-app/iconicon.png') // Add your own icon path, not working?
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', click: () => win.show() },
    { label: 'Exit', click: () => {
      app.isQuitting = true
      app.quit()
    }}
  ])
  tray.setToolTip('Your App Name')
  tray.setContextMenu(contextMenu)

  globalShortcut.register('YourShortcut', () => {
    win.isVisible() ? win.hide() : win.show()
  })
})

app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
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
