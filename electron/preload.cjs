const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAPI', {
  isDesktop: true,
  exportBackup: (projects) => ipcRenderer.invoke('backup:export', projects),
  importBackup: () => ipcRenderer.invoke('backup:import'),
});
