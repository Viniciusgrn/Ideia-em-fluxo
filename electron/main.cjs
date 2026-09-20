const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const fs = require('fs');
const path = require('path');

const APP_NAME = 'Ideia em Fluxo';
const SMOKE_TEST = process.argv.includes('--smoke-test');

function createWindow() {
  const window = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 760,
    minHeight: 600,
    show: false,
    backgroundColor: '#07111f',
    icon: path.join(__dirname, '..', 'assets', 'icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  window.once('ready-to-show', () => {
    if (SMOKE_TEST) {
      console.log('IDEIA_EM_FLUXO_SMOKE_TEST_OK');
      app.quit();
      return;
    }
    window.show();
  });
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
}

ipcMain.handle('backup:export', async (_event, projects) => {
  const result = await dialog.showSaveDialog({
    title: 'Salvar backup do Ideia em Fluxo',
    defaultPath: `ideia-em-fluxo-backup-${new Date().toISOString().slice(0, 10)}.json`,
    filters: [{ name: 'Backup JSON', extensions: ['json'] }],
  });
  if (result.canceled || !result.filePath) return { canceled: true };
  const backup = {
    app: APP_NAME,
    version: 1,
    exportedAt: new Date().toISOString(),
    projects,
  };
  fs.writeFileSync(result.filePath, `${JSON.stringify(backup, null, 2)}\n`, 'utf8');
  return { canceled: false, filePath: result.filePath };
});

ipcMain.handle('backup:import', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Restaurar backup do Ideia em Fluxo',
    properties: ['openFile'],
    filters: [{ name: 'Backup JSON', extensions: ['json'] }],
  });
  if (result.canceled || !result.filePaths[0]) return { canceled: true };
  const parsed = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf8'));
  const projects = Array.isArray(parsed) ? parsed : parsed.projects;
  if (!Array.isArray(projects)) throw new Error('Este arquivo não contém um backup válido.');
  return { canceled: false, projects };
});

app.whenReady().then(() => {
  app.setName(APP_NAME);
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
