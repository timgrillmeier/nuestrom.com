// use "npx electron-forge import" to prepare a forge
// use "npm run make" to export your app


const { app, BrowserWindow } = require('electron')
const path = require('path')

const Store = require('./store.js');
let mainWindow; //do this so that the window object doesn't get GC'd

// First instantiate the class
const store = new Store({
  // We'll call our data file 'user-preferences'
  configName: 'user-preferences',
  defaults: {
	windowBounds: { width: 800, height: 600 }
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('ready', () => {
  let { width, height } = store.get('windowBounds')
  mainWindow = new BrowserWindow({ width, height })

  mainWindow.on('resize', () => {
    let { width, height } = mainWindow.getBounds();
    store.set('windowBounds', { width, height });
  });

  mainWindow.loadURL('file://' + path.join(__dirname, 'index.html'));

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  app.on('window-all-closed', () => {
	app.quit()
  })
})
