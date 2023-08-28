// use "npx electron-forge import" to prepare a forge
// use "npm run make" to export your app


const { app, BrowserWindow } = require('electron')
// include the Node.js 'path' module at the top of your file
const path = require('path')

// modify your existing createWindow() function
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'assets/images/icons/icon.png'),
    webPreferences: {
      // preload: path.join(__dirname, 'Nuestrom.js')
    }
  })
  // win.webContents.openDevTools()

  win.loadFile('index.html')
}
// ...

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

