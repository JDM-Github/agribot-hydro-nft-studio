import { app, BrowserWindow, ipcMain } from 'electron';
import contextMenu from 'electron-context-menu';
import serve from 'electron-serve';
import path from 'path';

const serveURL = serve({ directory: '.' });
const port = process.env.PORT || 5173;
const dev = !app.isPackaged;
let mainWindow;

function createWindow() {
	const mainWindow = new BrowserWindow({
		backgroundColor: 'whitesmoke',
		autoHideMenuBar: true,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: true,
			devTools: dev,
			preload: path.join(import.meta.url, 'preload.mjs')
		}
	});

	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
		mainWindow.focus();
	});

	return mainWindow;
}

contextMenu();

function loadVite(port) {
	mainWindow.loadURL(`http://localhost:${port}`).catch(() => {
		setTimeout(() => loadVite(port), 200);
	});
}

function createMainWindow() {
	mainWindow = createWindow();
	if (dev) loadVite(port);
	else serveURL(mainWindow);
}

app.once('ready', createMainWindow);
app.on('activate', () => {
	if (!mainWindow) createMainWindow();
});
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});
