import { app, BrowserWindow, globalShortcut, Tray, Menu } from 'electron';
import * as path from 'path';

global['ShowClipClipShortcut'] = (process.platform === 'darwin' ? 'Command+Alt+Shift+C' : 'Control+Alt+Shift+C');

declare var __dirname: string;

let mainWindow: Electron.BrowserWindow;

function toggleClipClip() {
  if (mainWindow) {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  } else {
    mainWindow = new BrowserWindow({
      width: 500,
      height: 700,
      frame: false,
      icon: path.join(__dirname, 'assets', 'clipboard.png'),
      center: true
    });

    mainWindow.loadURL(`file://${__dirname}/index.html`);
    mainWindow.on('close', () => {
      app.quit();
    })
  }
}

let tray: Tray;

function onReady() {
  tray = new Tray(path.join(__dirname, 'assets', 'clipboard.png'));
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Exit', type: 'normal', click: () => { app.quit(); }}
  ]);
  tray.setToolTip('Click to show/hide ClipClip ( ' + global['ShowClipClipShortcut'] + ' ). Use Exit in context menu to quit.');
  tray.setContextMenu(contextMenu);
  tray.on('click', toggleClipClip);

  globalShortcut.register(global['ShowClipClipShortcut'], () => {
    toggleClipClip();
  });

  toggleClipClip();
}

app.on('ready', () => onReady());

app.on('will-quit', () => {
  // Unregister a shortcut.
  globalShortcut.unregister(global['ShowClipClipShortcut']);

  // Unregister all shortcuts.
  globalShortcut.unregisterAll();

  if (tray && !tray.isDestroyed()) {
    tray.destroy();
  }
});
