const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('electronAPI', {
  // Aquí puedes exponer funciones seguras si necesitas
  getVersion: () => process.versions.electron,
  getPlatform: () => process.platform
})