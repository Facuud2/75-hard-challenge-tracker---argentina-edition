const { app, BrowserWindow } = require('electron')
const path = require('path')

// Desactivar sandbox para evitar errores en Linux
app.commandLine.appendSwitch('no-sandbox')
app.commandLine.appendSwitch('disable-web-security')
app.commandLine.appendSwitch('disable-features', 'VizDisplayCompositor')
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    icon: path.join(__dirname, 'assets/icon.png'), // Icono de la app
    show: false, // No mostrar hasta que esté listo
    autoHideMenuBar: true, // Ocultar menú por defecto
    titleBarStyle: 'hiddenInset' // Estilo moderno de barra de título
  })
  // Cargar la app
  if (app.isPackaged) {
    mainWindow.loadFile('dist/index.html')
  } else {
    mainWindow.loadURL('http://localhost:3000')
  }
  // Mostrar cuando esté listo
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
  // Abrir DevTools en desarrollo
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools()
  }
}
app.whenReady().then(createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})